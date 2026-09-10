import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { apiRateLimit, sensitiveRateLimit } from '../utils/rate-limit';
import { validate } from '../middleware/validate';
import { createWebhookSchema } from '../schemas';

const router = Router();

router.use(authMiddleware);
router.use(apiRateLimit);

// Middleware to check if user has access to the workspace
async function checkWorkspaceAccess(userId: number, workspaceId: number): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
    [workspaceId, userId]
  );
  return result.rows.length > 0;
}

// GET /webhooks
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const workspaceId = req.workspaceId || req.query.workspaceId;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!workspaceId) {
    res.status(400).json({ error: 'Workspace context is missing' });
    return;
  }

  const hasAccess = await checkWorkspaceAccess(userId, parseInt(workspaceId as string));
  if (!hasAccess) {
    res.status(403).json({ error: 'Unauthorized for this workspace' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT * FROM webhooks WHERE workspace_id = $1 ORDER BY created_at DESC',
      [workspaceId]
    );
    res.json({ webhooks: result.rows });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /webhooks
router.post(
  '/',
  sensitiveRateLimit,
  validate(createWebhookSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const workspaceId = req.workspaceId || req.query.workspaceId;
    const userId = req.user?.id;
    const { url, events } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!workspaceId) {
      res.status(400).json({ error: 'Workspace context is missing' });
      return;
    }

    const hasAccess = await checkWorkspaceAccess(userId, parseInt(workspaceId as string));
    if (!hasAccess) {
      res.status(403).json({ error: 'Unauthorized for this workspace' });
      return;
    }

    try {
      const crypto = require('crypto');
      const secret = crypto.randomBytes(32).toString('hex');

      const result = await pool.query(
        'INSERT INTO webhooks (workspace_id, url, secret, events) VALUES ($1, $2, $3, $4) RETURNING *',
        [workspaceId, url, secret, JSON.stringify(events)]
      );
      res.status(201).json({ webhook: result.rows[0] });
    } catch (error) {
      console.error('Error creating webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
