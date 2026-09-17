import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { pool } from '../db';

const router = Router();
router.use(authMiddleware);

// DELETE /users/me - Delete the authenticated user's account
router.delete('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete the user from the users table.
    // Due to ON DELETE CASCADE, this will also remove:
    // - workspace_members for this user
    // - audit_logs (actor_id set to NULL)
    // - workspace_invitations
    //
    // However, workspaces where this user was the ONLY owner/member might become orphaned.
    // For simplicity, we just delete the user.
    await client.query('DELETE FROM users WHERE id = $1', [req.user.id]);

    await client.query('COMMIT');
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
