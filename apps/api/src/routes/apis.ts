import { Router, Response } from 'express';
import crypto from 'crypto';
import { pool } from '../db';
import { authMiddleware, AuthRequest, checkWorkspaceRole } from '../middleware/auth';
import { logAuditAction } from '../utils/audit';
import { apiRateLimit, sensitiveRateLimit } from '../utils/rate-limit';
import { validate } from '../middleware/validate';
import { createApiSchema, updateApiSchema, createApiKeySchema } from '../schemas';

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

// POST /apis
router.post(
  '/',
  sensitiveRateLimit,
  validate(createApiSchema),
  async (req: AuthRequest, res: Response) => {
    const {
      workspace_id,
      name,
      slug,
      description,
      upstream_url,
      environment,
      rate_limit_enabled,
      rate_limit_max,
      rate_limit_window,
    } = req.body;
    const userId = req.user?.id;
    const hasAccess = await checkWorkspaceRole(userId!, workspace_id, ['admin', 'owner']);
    if (!hasAccess) {
      res.status(403).json({ error: 'Unauthorized: Requires admin or owner role' });
      return;
    }

    try {
      const result = await pool.query(
        `INSERT INTO apis (workspace_id, name, slug, description, upstream_url, environment, rate_limit_enabled, rate_limit_max, rate_limit_window) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
        [
          workspace_id,
          name,
          slug,
          description || null,
          upstream_url,
          environment || 'production',
          rate_limit_enabled || false,
          rate_limit_max || 100,
          rate_limit_window || 60,
        ]
      );
      const newApi = result.rows[0];

      // Audit log
      await logAuditAction(workspace_id, userId!, 'API_CREATED', 'api', newApi.id, { name, slug });

      res.status(201).json({ api: newApi });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({ error: 'API with this slug already exists in the workspace' });
      } else {
        console.error('Error creating API:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

// GET /apis
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const workspaceId = req.workspaceId || req.query.workspaceId;

  try {
    let query = `
      SELECT a.* 
      FROM apis a
      JOIN workspace_members wm ON a.workspace_id = wm.workspace_id
      WHERE wm.user_id = $1
    `;
    const params: any[] = [userId];

    if (workspaceId) {
      query += ` AND a.workspace_id = $2`;
      params.push(workspaceId);
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ apis: result.rows });
  } catch (error) {
    console.error('Error fetching APIs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /apis/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const result = await pool.query(
      `SELECT a.* 
       FROM apis a
       JOIN workspace_members wm ON a.workspace_id = wm.workspace_id
       WHERE a.id = $1 AND wm.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'API not found or unauthorized' });
      return;
    }
    res.json({ api: result.rows[0] });
  } catch (error) {
    console.error('Error fetching API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /apis/:id
router.patch('/:id', validate(updateApiSchema), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    name,
    slug,
    description,
    upstream_url,
    status,
    environment,
    rate_limit_enabled,
    rate_limit_max,
    rate_limit_window,
  } = req.body;
  const userId = req.user?.id;

  try {
    const accessCheck = await pool.query(
      `SELECT a.id, a.workspace_id, wm.role FROM apis a JOIN workspace_members wm ON a.workspace_id = wm.workspace_id WHERE a.id = $1 AND wm.user_id = $2`,
      [id, userId]
    );
    if (accessCheck.rows.length === 0) {
      res.status(404).json({ error: 'API not found or unauthorized' });
      return;
    }

    const { workspace_id, role } = accessCheck.rows[0];
    if (role.toLowerCase() !== 'admin' && role.toLowerCase() !== 'owner') {
      res.status(403).json({ error: 'Unauthorized: Requires admin or owner role' });
      return;
    }

    const updates = [];
    const params: any[] = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      params.push(name);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${idx++}`);
      params.push(slug);
    }
    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      params.push(description);
    }
    if (upstream_url !== undefined) {
      updates.push(`upstream_url = $${idx++}`);
      params.push(upstream_url);
    }
    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      params.push(status);
    }
    if (environment !== undefined) {
      updates.push(`environment = $${idx++}`);
      params.push(environment);
    }
    if (rate_limit_enabled !== undefined) {
      updates.push(`rate_limit_enabled = $${idx++}`);
      params.push(rate_limit_enabled);
    }
    if (rate_limit_max !== undefined) {
      updates.push(`rate_limit_max = $${idx++}`);
      params.push(rate_limit_max);
    }
    if (rate_limit_window !== undefined) {
      updates.push(`rate_limit_window = $${idx++}`);
      params.push(rate_limit_window);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await pool.query(
      `UPDATE apis SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    const updatedApi = result.rows[0];
    await logAuditAction(workspace_id, userId!, 'API_UPDATED', 'api', updatedApi.id, { updates });

    res.json({ api: updatedApi });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'API with this slug already exists in the workspace' });
    } else {
      console.error('Error updating API:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /apis/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const accessCheck = await pool.query(
      `SELECT a.id, a.workspace_id, wm.role FROM apis a JOIN workspace_members wm ON a.workspace_id = wm.workspace_id WHERE a.id = $1 AND wm.user_id = $2`,
      [id, userId]
    );
    if (accessCheck.rows.length === 0) {
      res.status(404).json({ error: 'API not found or unauthorized' });
      return;
    }

    const { workspace_id, role } = accessCheck.rows[0];
    if (role.toLowerCase() !== 'admin' && role.toLowerCase() !== 'owner') {
      res.status(403).json({ error: 'Unauthorized: Requires admin or owner role' });
      return;
    }

    await pool.query('DELETE FROM apis WHERE id = $1', [id]);
    await logAuditAction(workspace_id, userId!, 'API_DELETED', 'api', parseInt(id));

    res.json({ message: 'API deleted successfully' });
  } catch (error) {
    console.error('Error deleting API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------------------------------
// API Keys Management
// ----------------------------------------------------------------------------

function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const rawKey = `relay_live_${token}`;

  // Prefix is typically the first part of the token, useful for identification in the UI
  // For example: "relay_live_abc12..." - we might take 4-8 chars of the random part
  const keyPrefix = rawKey.substring(0, 15) + '...';

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  return { rawKey, keyHash, keyPrefix };
}

// POST /apis/:id/keys
router.post(
  '/:id/keys',
  sensitiveRateLimit,
  validate(createApiKeySchema),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, environment } = req.body;
    const userId = req.user?.id;
    try {
      // 1. Verify access to API
      const apiResult = await pool.query(
        `SELECT a.workspace_id, wm.role FROM apis a JOIN workspace_members wm ON a.workspace_id = wm.workspace_id WHERE a.id = $1 AND wm.user_id = $2`,
        [id, userId]
      );

      if (apiResult.rows.length === 0) {
        res.status(404).json({ error: 'API not found or unauthorized' });
        return;
      }

      const { workspace_id: workspaceId, role } = apiResult.rows[0];
      if (role.toLowerCase() !== 'admin' && role.toLowerCase() !== 'owner') {
        res.status(403).json({ error: 'Unauthorized: Requires admin or owner role' });
        return;
      }

      // 2. Generate Key
      const { rawKey, keyHash, keyPrefix } = generateApiKey();

      // 3. Store Key Hash
      const insertResult = await pool.query(
        `INSERT INTO api_keys (workspace_id, api_id, name, key_hash, key_prefix, environment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, workspace_id, api_id, name, key_prefix, environment, created_at`,
        [workspaceId, id, name, keyHash, keyPrefix, environment || 'production']
      );

      const apiKeyMetadata = insertResult.rows[0];

      await logAuditAction(workspaceId, userId!, 'API_KEY_CREATED', 'api_key', apiKeyMetadata.id, {
        name,
        api_id: id,
      });

      // 4. Return Raw Key (ONLY ONCE)
      res.status(201).json({
        apiKey: apiKeyMetadata,
        rawKey: rawKey, // IMPORTANT: This is the only time the user will see this
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /apis/:id/keys
router.get('/:id/keys', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const accessCheck = await pool.query(
      `SELECT a.id FROM apis a JOIN workspace_members wm ON a.workspace_id = wm.workspace_id WHERE a.id = $1 AND wm.user_id = $2`,
      [id, userId]
    );
    if (accessCheck.rows.length === 0) {
      res.status(404).json({ error: 'API not found or unauthorized' });
      return;
    }

    const result = await pool.query(
      `SELECT id, workspace_id, api_id, name, key_prefix, environment, created_at, expires_at, last_used_at, revoked_at 
       FROM api_keys 
       WHERE api_id = $1 AND revoked_at IS NULL
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({ keys: result.rows });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
