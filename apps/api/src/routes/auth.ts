import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { authRateLimit } from '../utils/rate-limit';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, googleAuthSchema } from '../schemas';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post(
  '/google',
  authRateLimit,
  validate(googleAuthSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id_token } = req.body;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(400).json({ error: 'Invalid Google token payload' });
        return;
      }

      const email = payload.email;
      const name = payload.name || email.split('@')[0];

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (userRes.rows.length === 0) {
          const userResult = await client.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
            [email, ''] // empty password since they use OAuth
          );
          user = userResult.rows[0];
        } else {
          user = userRes.rows[0];
        }

        await client.query('COMMIT');

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        // Omit password hash in response
        const { password_hash, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
  }
);

router.post(
  '/register',
  authRateLimit,
  validate(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, workspace_name } = req.body;
    const client = await pool.connect();
    try {
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        res.status(409).json({ error: 'Email already exists' });
        return;
      }

      await client.query('BEGIN');

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 1. Create User
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email, passwordHash]
      );
      const user = userResult.rows[0];

      // 2. Create Workspace
      const slug = workspace_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + user.id;
      const wsResult = await client.query(
        'INSERT INTO workspaces (name, slug) VALUES ($1, $2) RETURNING id',
        [workspace_name, slug]
      );
      const workspaceId = wsResult.rows[0].id;

      // 3. Add user as OWNER of workspace
      await client.query(
        'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)',
        [workspaceId, user.id, 'OWNER']
      );

      await client.query('COMMIT');

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ user, token });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }
);

router.post(
  '/login',
  authRateLimit,
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      // Omit password hash in response
      const { password_hash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [
      userId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  // Client is responsible for discarding the token
  res.json({ status: 'ok', message: 'Logged out successfully' });
});

router.delete('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Find workspaces where this user is the OWNER
    const workspacesResult = await client.query(
      `SELECT workspace_id FROM workspace_members WHERE user_id = $1 AND role = 'OWNER'`,
      [userId]
    );
    const workspaceIds = workspacesResult.rows.map(row => row.workspace_id);

    if (workspaceIds.length > 0) {
      // Find which of these workspaces have ONLY this user as owner
      const ownersCountResult = await client.query(
        `SELECT workspace_id, COUNT(user_id) as owner_count 
         FROM workspace_members 
         WHERE workspace_id = ANY($1) AND role = 'OWNER' 
         GROUP BY workspace_id`,
        [workspaceIds]
      );
      
      const workspacesToDelete = ownersCountResult.rows
        .filter(row => parseInt(row.owner_count) === 1)
        .map(row => row.workspace_id);

      if (workspacesToDelete.length > 0) {
        // Delete workspaces where this user is the only owner (cascades)
        await client.query(
          `DELETE FROM workspaces WHERE id = ANY($1)`,
          [workspacesToDelete]
        );
      }
    }

    // 2. Delete the user (cascades to delete remaining workspace_members rows)
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');
    res.json({ message: 'User account and associated data permanently deleted' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
