import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { apiRateLimit } from '../utils/rate-limit';

const router = Router();

router.use(authMiddleware);
router.use(apiRateLimit);

// GET my pending invitations
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const result = await pool.query(
      `SELECT wi.id, wi.role, wi.status, wi.created_at,
              w.name as workspace_name, w.slug as workspace_slug,
              u.email as invited_by_email
       FROM workspace_invitations wi
       JOIN workspaces w ON wi.workspace_id = w.id
       LEFT JOIN users u ON wi.invited_by_user_id = u.id
       WHERE wi.invited_user_id = $1 AND wi.status = 'pending'
       ORDER BY wi.created_at DESC`,
      [userId]
    );

    res.json({ invitations: result.rows });
  } catch (error) {
    console.log('Error getting invitations', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST accept invitation
router.post('/:inviteId/accept', async (req: AuthRequest, res: Response) => {
  const inviteId = req.params.inviteId;
  const userId = req.user?.id;

  try {
    // Get the invitation
    const invite = await pool.query(
      'SELECT * FROM workspace_invitations WHERE id = $1 AND invited_user_id = $2 AND status = $3',
      [inviteId, userId, 'pending']
    );

    if (invite.rows.length === 0) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    const invitation = invite.rows[0];

    // Add user to workspace
    await pool.query(
      'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)',
      [invitation.workspace_id, userId, invitation.role]
    );

    // Update invitation status
    await pool.query(
      'UPDATE workspace_invitations SET status = $1, updated_at = NOW() WHERE id = $2',
      ['accepted', inviteId]
    );

    res.json({ success: true, message: 'Invitation accepted' });
  } catch (error: any) {
    if (error.code === '23505') {
      // Already a member somehow
      await pool.query(
        'UPDATE workspace_invitations SET status = $1, updated_at = NOW() WHERE id = $2',
        ['accepted', inviteId]
      );
      res.json({ success: true, message: 'You are already a member' });
    } else {
      console.log('Error accepting invitation', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST reject invitation
router.post('/:inviteId/reject', async (req: AuthRequest, res: Response) => {
  const inviteId = req.params.inviteId;
  const userId = req.user?.id;

  try {
    const invite = await pool.query(
      'SELECT id FROM workspace_invitations WHERE id = $1 AND invited_user_id = $2 AND status = $3',
      [inviteId, userId, 'pending']
    );

    if (invite.rows.length === 0) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    // Update to rejected
    await pool.query(
      'UPDATE workspace_invitations SET status = $1, updated_at = NOW() WHERE id = $2',
      ['rejected', inviteId]
    );

    res.json({ success: true, message: 'Invitation rejected' });
  } catch (error) {
    console.log('Error rejecting invitation', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
