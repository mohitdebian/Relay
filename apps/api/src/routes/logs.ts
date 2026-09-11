import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Middleware to check if user has access to the workspace
async function checkWorkspaceAccess(userId: number, workspaceId: number): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
    [workspaceId, userId]
  );
  return result.rows.length > 0;
}

// GET /logs
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

  const parsedWorkspaceId = parseInt(workspaceId as string, 10);
  if (isNaN(parsedWorkspaceId)) {
    res.status(400).json({ error: 'Invalid workspace ID' });
    return;
  }

  const hasAccess = await checkWorkspaceAccess(userId, parsedWorkspaceId);
  if (!hasAccess) {
    res.status(403).json({ error: 'Unauthorized for this workspace' });
    return;
  }

  try {
    // Fetch logs for all APIs in this workspace
    const result = await pool.query(
      `
      SELECT 
        l.id,
        l.status_code,
        l.latency_ms,
        l.created_at,
        l.method,
        l.path,
        a.name as api_name,
        a.upstream_url
      FROM api_request_logs l
      JOIN apis a ON l.api_id = a.id
      WHERE a.workspace_id = $1
      ORDER BY l.created_at DESC
      LIMIT 50
    `,
      [workspaceId]
    );

    const logs = result.rows.map((row) => ({
      id: row.id,
      time: new Date(row.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      method: row.method || 'GET', 
      path: row.path !== null && row.path !== undefined && row.path !== '' ? row.path : (row.path === '' ? '/' : row.upstream_url),
      status: row.status_code,
      latency: `${row.latency_ms}ms`,
      api: row.api_name,
    }));

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
