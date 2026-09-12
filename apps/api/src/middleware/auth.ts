import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { pool } from '../db';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const NEON_AUTH_URL =
  process.env.NEON_AUTH_BASE_URL ||
  'https://ep-falling-cell-axrlzm3b.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth';

const client = (jwksClient as any)({
  jwksUri: `${NEON_AUTH_URL}/.well-known/jwks.json`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err: any, key: any) {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
  workspaceId?: number;
}

// Simple in-memory cache to prevent slow API calls on every request
const sessionCache = new Map<string, { user: any; expiresAt: number }>();

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const workspaceIdHeader = req.headers['x-workspace-id'];
  if (workspaceIdHeader && !Array.isArray(workspaceIdHeader)) {
    const parsedId = parseInt(workspaceIdHeader, 10);
    if (!isNaN(parsedId)) {
      req.workspaceId = parsedId;
    }
  }

  const handleAuthenticatedUser = async (email: string, subId: string, name: string) => {
    try {
      const dbClient = await pool.connect();
      try {
        const result = await dbClient.query('SELECT id, email FROM users WHERE email = $1', [
          email,
        ]);
        let user;

        if (result.rows.length === 0) {
          await dbClient.query('BEGIN');
          const userResult = await dbClient.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, subId]
          );
          user = userResult.rows[0];

          await dbClient.query('COMMIT');
        } else {
          user = result.rows[0];
        }

        req.user = { id: user.id, email: user.email };
        next();
      } catch (dbError) {
        await dbClient.query('ROLLBACK');
        console.error('JIT user creation error:', dbError);
        res.status(500).json({ error: 'Internal server error' });
      } finally {
        dbClient.release();
      }
    } catch (e) {
      console.error('Database connection error:', e);
      res.status(500).json({ error: 'Database connection error' });
    }
  };

  if (token.split('.').length === 3) {
    const handleDecodedToken = async (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
      }
      const payload = decoded as { id?: string; sub?: string; email?: string; name?: string };
      const email = payload.email;
      const subId = payload.sub || payload.id;

      if (!email || !subId) {
        res.status(401).json({ error: 'Unauthorized: Token missing email or sub' });
        return;
      }

      await handleAuthenticatedUser(email, subId, payload.name || email.split('@')[0]);
    };

    const decodedToken = jwt.decode(token, { complete: true }) as any;
    if (decodedToken && decodedToken.header && decodedToken.header.kid) {
      jwt.verify(token, getKey, {}, handleDecodedToken);
    } else {
      res.status(401).json({ error: 'Unauthorized: Invalid token format' });
      return;
    }
  } else {
    // Check cache first
    const cached = sessionCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      await handleAuthenticatedUser(
        cached.user.email,
        cached.user.id,
        cached.user.name || cached.user.email.split('@')[0]
      );
      return;
    }

    if (token.startsWith('relay_ws_')) {
      try {
        const keyHash = crypto.createHash('sha256').update(token).digest('hex');

        const dbClient = await pool.connect();
        try {
          const result = await dbClient.query(
            'SELECT id, workspace_id, name FROM workspace_api_keys WHERE key_hash = $1 AND revoked_at IS NULL',
            [keyHash]
          );

          if (result.rows.length === 0) {
            res.status(401).json({ error: 'Unauthorized: Invalid or revoked workspace API key' });
            return;
          }

          const keyInfo = result.rows[0];

          // Impersonate a workspace admin/owner so existing route logic works seamlessly
          const ownerResult = await dbClient.query(
            "SELECT user_id FROM workspace_members WHERE workspace_id = $1 AND role IN ('owner', 'admin') LIMIT 1",
            [keyInfo.workspace_id]
          );

          if (ownerResult.rows.length === 0) {
            res.status(401).json({ error: 'Unauthorized: Workspace has no valid owner or admin' });
            return;
          }

          // Update last used asynchronously
          dbClient
            .query('UPDATE workspace_api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1', [
              keyInfo.id,
            ])
            .catch((e) => console.error('Failed to update last_used_at for workspace key:', e));

          req.user = {
            id: ownerResult.rows[0].user_id,
            email: `workspace_key_${keyInfo.id}@relay.internal`,
          };
          req.workspaceId = keyInfo.workspace_id;
          (req as any).isWorkspaceKey = true;

          next();
          return;
        } finally {
          dbClient.release();
        }
      } catch (error) {
        console.error('Workspace API key verification error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
        return;
      }
    }

    try {
      const response = await fetch(`${NEON_AUTH_URL}/get-session`, {
        headers: {
          Cookie: `__Secure-neon-auth.session_token=${token}; neon-auth.session_token=${token}; better-auth.session_token=${token}`,
        },
      });

      const data = await response.json();

      if (!data || !data.session || !data.user || !data.user.email) {
        res.status(401).json({ error: 'Unauthorized: Invalid session' });
        return;
      }

      sessionCache.set(token, { user: data.user, expiresAt: Date.now() + 60000 });
      await handleAuthenticatedUser(
        data.user.email,
        data.user.id,
        data.user.name || data.user.email.split('@')[0]
      );
    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(500).json({ error: 'Internal server error during authentication' });
    }
  }
}

export async function checkWorkspaceRole(
  userId: number,
  workspaceId: number,
  requiredRoles: string[] = ['admin', 'owner', 'viewer']
): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );
    if (result.rows.length === 0) return false;
    const role = result.rows[0].role;
    return requiredRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase());
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}
