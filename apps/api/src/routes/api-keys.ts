import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logAuditAction } from '../utils/audit';
import { apiRateLimit } from '../utils/rate-limit';

const router = Router();

router.use(authMiddleware);
router.use(apiRateLimit);

// DELETE /api-keys/:id (Revoke API key)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Check access by joining through apis and workspace_members
    const accessCheck = await pool.query(
      `SELECT k.id, a.workspace_id, wm.role 
       FROM api_keys k
       JOIN apis a ON k.api_id = a.id
       JOIN workspace_members wm ON a.workspace_id = wm.workspace_id
       WHERE k.id = $1 AND wm.user_id = $2`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      res.status(404).json({ error: 'API key not found or unauthorized' });
      return;
    }

    const { workspace_id: workspaceId, role } = accessCheck.rows[0];
    if (role.toLowerCase() !== 'admin' && role.toLowerCase() !== 'owner') {
      res.status(403).json({ error: 'Unauthorized: Requires admin or owner role' });
      return;
    }

    // Soft delete by setting revoked_at
    await pool.query(`UPDATE api_keys SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

    await logAuditAction(workspaceId, userId!, 'API_KEY_REVOKED', 'api_key', parseInt(id));

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
