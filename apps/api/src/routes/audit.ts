import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest, checkWorkspaceRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /workspaces/:id/audit-logs
router.get('/:id/audit-logs', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // Parse pagination parameters
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    // Only admins or owners can view audit logs
    const hasAccess = await checkWorkspaceRole(userId!, parseInt(id), ['admin', 'owner']);
    if (!hasAccess) {
      res.status(403).json({ error: 'Unauthorized: Requires admin or owner role' });
      return;
    }

    const result = await pool.query(
      `SELECT al.id, al.action, al.resource_type, al.resource_id, al.metadata, al.created_at,
              u.email as actor_email
       FROM audit_logs al
       LEFT JOIN users u ON al.actor_id = u.id
       WHERE al.workspace_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_logs WHERE workspace_id = $1`,
      [id]
    );

    res.json({
      auditLogs: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
