import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { apiRateLimit } from '../utils/rate-limit';
import { validate } from '../middleware/validate';
import { createWorkspaceSchema, updateWorkspaceSchema, inviteMemberSchema } from '../schemas';
const router = Router();

// Ensure all routes are protected
router.use(authMiddleware);
router.use(apiRateLimit);

// CREATE a workspace
router.post('/', validate(createWorkspaceSchema), async (req: AuthRequest, res: Response) => {
  const { name, slug } = req.body;
  const userId = req.user?.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert workspace
    const workspaceResult = await client.query(
      'INSERT INTO workspaces (name, slug) VALUES ($1, $2) RETURNING id, name, slug, created_at, updated_at',
      [name, slug]
    );
    const workspace = workspaceResult.rows[0];

    // Insert owner member
    await client.query(
      'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)',
      [workspace.id, userId, 'OWNER']
    );

    await client.query('COMMIT');
    res.status(201).json({ workspace });
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      // Unique violation
      res.status(409).json({ error: 'Workspace with this slug already exists' });
    } else {
      console.error('Error creating workspace:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } finally {
    client.release();
  }
});

// GET all workspaces for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const result = await pool.query(
      `SELECT w.id, w.name, w.slug, w.created_at, w.updated_at, wm.role
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE wm.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json({ workspaces: result.rows });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET workspace by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Check if user is a member and get workspace details
    const result = await pool.query(
      `SELECT w.id, w.name, w.slug, w.created_at, w.updated_at, wm.role
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE w.id = $1 AND wm.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Workspace not found or unauthorized' });
      return;
    }

    res.json({ workspace: result.rows[0] });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET workspace members
router.get('/:id/members', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Check if user is a member
    const checkResult = await pool.query(
      'SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Workspace not found or unauthorized' });
      return;
    }

    const result = await pool.query(
      `SELECT u.id, u.email, wm.role, wm.created_at
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = $1
       ORDER BY wm.created_at ASC`,
      [id]
    );

    const invites = await pool.query(
      `SELECT wi.id, u.email, wi.role, wi.created_at, wi.status
       FROM workspace_invitations wi
       JOIN users u ON wi.invited_user_id = u.id
       WHERE wi.workspace_id = $1 AND wi.status = 'pending'
       ORDER BY wi.created_at ASC`,
      [id]
    );

    res.json({ members: result.rows, invitations: invites.rows, currentUserId: userId });
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/:id/members',
  validate(inviteMemberSchema),
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const email = req.body.email;
    const role = req.body.role;
    const userId = req.user?.id;

    try {
      // Check if user is in workspace first
      const check = await pool.query(
        'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [id, userId]
      );

      if (check.rows.length === 0) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      // Only owner or admin can invite
      const userRole = check.rows[0].role;
      if (userRole.toLowerCase() !== 'owner' && userRole.toLowerCase() !== 'admin') {
        res.status(403).json({ error: 'You are not allowed to invite members' });
        return;
      }

      // Prevent privilege escalation: only owners can invite owners
      if (role.toLowerCase() === 'owner' && userRole.toLowerCase() !== 'owner') {
        res.status(403).json({ error: 'Only owners can invite other owners' });
        return;
      }

      // Find the user by email
      const findUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

      if (findUser.rows.length === 0) {
        res.status(400).json({ error: 'User with this email does not exist in the system' });
        return;
      }

      const newUserId = findUser.rows[0].id;

      // Check if already in workspace
      const checkMember = await pool.query(
        'SELECT workspace_id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [id, newUserId]
      );

      if (checkMember.rows.length > 0) {
        res.status(400).json({ error: 'User is already in the workspace' });
        return;
      }

      // Check if there is already a pending invite
      const checkInvite = await pool.query(
        'SELECT id FROM workspace_invitations WHERE workspace_id = $1 AND invited_user_id = $2 AND status = $3',
        [id, newUserId, 'pending']
      );

      if (checkInvite.rows.length > 0) {
        res.status(400).json({ error: 'An invitation is already pending for this user' });
        return;
      }

      // Create the invitation
      await pool.query(
        'INSERT INTO workspace_invitations (workspace_id, invited_user_id, invited_by_user_id, role, status) VALUES ($1, $2, $3, $4, $5)',
        [id, newUserId, userId, role, 'pending']
      );

      res.json({ success: true, message: 'Invitation sent successfully' });
    } catch (error) {
      console.log('Error inviting member', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE workspace member
router.delete('/:id/members/:targetUserId', async (req: AuthRequest, res: Response) => {
  const { id, targetUserId } = req.params;
  const userId = req.user?.id;

  try {
    // Check if requester is a member and their role
    const checkResult = await pool.query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Workspace not found or unauthorized' });
      return;
    }

    const role = checkResult.rows[0].role;
    if (role.toLowerCase() !== 'owner' && role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Only owners or admins can remove members' });
      return;
    }

    // You cannot remove yourself
    if (Number(targetUserId) === userId) {
      res.status(400).json({ error: 'You cannot remove yourself from the workspace' });
      return;
    }

    // Check target's role
    const targetCheck = await pool.query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [id, targetUserId]
    );

    if (targetCheck.rows.length === 0) {
      res.status(404).json({ error: 'Member not found in workspace' });
      return;
    }

    if (targetCheck.rows[0].role === 'OWNER') {
      res.status(403).json({ error: 'Cannot remove the workspace owner' });
      return;
    }

    await pool.query('DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2', [
      id,
      targetUserId,
    ]);

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing workspace member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE workspace
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Check if user is a member (ideally OWNER, but we'll accept any member for now or specifically check role)
    const checkResult = await pool.query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Workspace not found or unauthorized' });
      return;
    }

    const role = checkResult.rows[0].role;
    if (role.toLowerCase() !== 'owner' && role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Only owners or admins can delete workspaces' });
      return;
    }

    // Delete the workspace. ON DELETE CASCADE will handle apis, keys, members, logs, etc.
    await pool.query('DELETE FROM workspaces WHERE id = $1', [id]);

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', validate(updateWorkspaceSchema), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, slug } = req.body;
  const userId = req.user?.id;

  try {
    const checkResult = await pool.query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Workspace not found or unauthorized' });
      return;
    }

    const role = checkResult.rows[0].role;
    if (role.toLowerCase() !== 'owner' && role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Only owners or admins can update workspaces' });
      return;
    }

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (slug) {
      updateFields.push(`slug = $${paramIndex++}`);
      values.push(slug);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE workspaces SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, slug, updated_at`,
      values
    );

    res.json({ workspace: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Workspace with this slug already exists' });
    } else {
      console.error('Error updating workspace:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
