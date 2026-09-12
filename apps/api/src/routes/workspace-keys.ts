import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest, checkWorkspaceRole } from '../middleware/auth';
import crypto from 'crypto';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { logAuditAction } from '../utils/audit';

const router = Router();
router.use(authMiddleware);

const createWorkspaceKeySchema = z.object({
  name: z.string().min(1).max(255),
  workspaceId: z.number().int().positive(),
});

function generateWorkspaceKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const prefix = 'relay_ws_';
  const rawKey = `${prefix}${token}`;

  // Prefix is typically the first part of the token, useful for identification in the UI
  const keyPrefix = rawKey.substring(0, 15) + '...';
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  return { rawKey, keyHash, keyPrefix };
}

// GET /workspace-keys
router.get('/', async (req: AuthRequest, res: Response) => {
  const workspaceId = req.query.workspaceId
    ? parseInt(req.query.workspaceId as string, 10)
    : req.workspaceId;
  const userId = req.user?.id;

  if (!workspaceId || !userId) {
    res.status(400).json({ error: 'Missing workspaceId' });
    return;
  }

  try {
    const hasAccess = await checkWorkspaceRole(userId, workspaceId, ['owner', 'admin', 'viewer']);
    if (!hasAccess) {
      res.status(403).json({ error: 'Unauthorized access to workspace' });
      return;
    }

    const result = await pool.query(
      `SELECT id, name, key_prefix, created_at, last_used_at, revoked_at 
       FROM workspace_api_keys 
       WHERE workspace_id = $1 AND revoked_at IS NULL
       ORDER BY created_at DESC`,
      [workspaceId]
    );

    res.json({ keys: result.rows });
  } catch (error) {
    console.error('Error fetching workspace keys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /workspace-keys
router.post('/', validate(createWorkspaceKeySchema), async (req: AuthRequest, res: Response) => {
  const { name, workspaceId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const hasAccess = await checkWorkspaceRole(userId, workspaceId, ['owner', 'admin']);
    if (!hasAccess) {
      res.status(403).json({ error: 'Unauthorized: Requires admin or owner role' });
      return;
    }

    const { rawKey, keyHash, keyPrefix } = generateWorkspaceKey();

    const insertResult = await pool.query(
      `INSERT INTO workspace_api_keys (workspace_id, name, key_hash, key_prefix)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, key_prefix, created_at`,
      [workspaceId, name, keyHash, keyPrefix]
    );

    const apiKeyMetadata = insertResult.rows[0];

    await logAuditAction(
      workspaceId,
      userId,
      'WORKSPACE_KEY_CREATED',
      'workspace_api_key',
      apiKeyMetadata.id,
      { name }
    );

    res.status(201).json({
      key: apiKeyMetadata,
      rawKey,
    });
  } catch (error) {
    console.error('Error creating workspace key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /workspace-keys/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const keyCheck = await pool.query(
      'SELECT workspace_id, name FROM workspace_api_keys WHERE id = $1',
      [id]
    );

    if (keyCheck.rows.length === 0) {
      res.status(404).json({ error: 'Workspace key not found' });
      return;
    }

    const workspaceId = keyCheck.rows[0].workspace_id;
    const hasAccess = await checkWorkspaceRole(userId, workspaceId, ['owner', 'admin']);

    if (!hasAccess) {
      res.status(403).json({ error: 'Unauthorized: Requires admin or owner role' });
      return;
    }

    await pool.query(`UPDATE workspace_api_keys SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1`, [
      id,
    ]);
    await logAuditAction(
      workspaceId,
      userId,
      'WORKSPACE_KEY_REVOKED',
      'workspace_api_key',
      parseInt(id),
      { name: keyCheck.rows[0].name }
    );

    res.json({ message: 'Workspace key revoked successfully' });
  } catch (error) {
    console.error('Error revoking workspace key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
