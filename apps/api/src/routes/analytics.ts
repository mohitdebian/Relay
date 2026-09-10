import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { apiRateLimit } from '../utils/rate-limit';

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

// GET /analytics/overview
// Workspace-level analytics
router.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
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
    // 1. Fetch Aggregated Metrics across all APIs
    const overviewResult = await pool.query(
      `
      SELECT 
        COUNT(*) as total_requests,
        COALESCE(AVG(latency_ms), 0) as average_latency,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as total_errors
      FROM api_request_logs l
      JOIN apis a ON l.api_id = a.id
      WHERE a.workspace_id = $1
    `,
      [workspaceId]
    );

    // 2. Fetch by Endpoint (mocked via upstream_url for now)
    const byEndpointResult = await pool.query(
      `
      SELECT 
        a.upstream_url as path,
        COUNT(*) as requests,
        COUNT(CASE WHEN l.status_code >= 400 THEN 1 END) as errors,
        COALESCE(AVG(l.latency_ms), 0) as latency_ms
      FROM api_request_logs l
      JOIN apis a ON l.api_id = a.id
      WHERE a.workspace_id = $1
      GROUP BY a.upstream_url
      ORDER BY requests DESC
      LIMIT 10
    `,
      [workspaceId]
    );

    // 3. Fetch by API Key
    const byKeyResult = await pool.query(
      `
      SELECT 
        k.name,
        COUNT(*) as requests
      FROM api_request_logs l
      JOIN api_keys k ON l.api_key_id = k.id
      WHERE k.workspace_id = $1
      GROUP BY k.name
      ORDER BY requests DESC
      LIMIT 10
    `,
      [workspaceId]
    );

    res.json({
      overview: {
        totalRequests: parseInt(overviewResult.rows[0].total_requests) || 0,
        averageLatencyMs: Math.round(parseFloat(overviewResult.rows[0].average_latency)) || 0,
        totalErrors: parseInt(overviewResult.rows[0].total_errors) || 0,
      },
      byEndpoint: byEndpointResult.rows.map((row) => ({
        path: row.path,
        requests: parseInt(row.requests),
        errors: parseInt(row.errors),
        latency: `${Math.round(parseFloat(row.latency_ms))}ms`,
      })),
      byKey: byKeyResult.rows.map((row) => ({
        name: row.name,
        requests: parseInt(row.requests),
        cost: '$0.00', // Mocked cost
      })),
    });
  } catch (error) {
    console.error('Error fetching workspace analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/:workspaceId/apis/:apiId
// Simple overview analytics
router.get('/:workspaceId/apis/:apiId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspaceId, apiId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const hasAccess = await checkWorkspaceAccess(userId, parseInt(workspaceId));
  if (!hasAccess) {
    res.status(403).json({ error: 'Unauthorized for this workspace' });
    return;
  }

  try {
    // 1. Verify API belongs to workspace
    const apiCheck = await pool.query('SELECT id FROM apis WHERE id = $1 AND workspace_id = $2', [
      apiId,
      workspaceId,
    ]);

    if (apiCheck.rows.length === 0) {
      res.status(404).json({ error: 'API not found in this workspace' });
      return;
    }

    // 2. Fetch Aggregated Metrics
    const overviewResult = await pool.query(
      `
      SELECT 
        COUNT(*) as total_requests,
        COALESCE(AVG(latency_ms), 0) as average_latency,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as total_errors
      FROM api_request_logs
      WHERE api_id = $1
    `,
      [apiId]
    );

    // 3. Fetch Status Codes Breakdown
    const statusResult = await pool.query(
      `
      SELECT status_code, COUNT(*) as count
      FROM api_request_logs
      WHERE api_id = $1
      GROUP BY status_code
      ORDER BY status_code
    `,
      [apiId]
    );

    // 4. Fetch Requests Over Time (last 24 hours grouped by hour)
    // Note: for a simpler fresher approach we just group by hour
    const timeseriesResult = await pool.query(
      `
      SELECT 
        DATE_TRUNC('hour', created_at) as timestamp,
        COUNT(*) as requests
      FROM api_request_logs
      WHERE api_id = $1 AND created_at >= NOW() - INTERVAL '24 HOURS'
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY timestamp ASC
    `,
      [apiId]
    );

    res.json({
      overview: {
        totalRequests: parseInt(overviewResult.rows[0].total_requests) || 0,
        averageLatencyMs: Math.round(parseFloat(overviewResult.rows[0].average_latency)) || 0,
        totalErrors: parseInt(overviewResult.rows[0].total_errors) || 0,
      },
      statusCodes: statusResult.rows.map((row) => ({
        statusCode: row.status_code,
        count: parseInt(row.count),
      })),
      timeseries: timeseriesResult.rows.map((row) => ({
        timestamp: row.timestamp,
        requests: parseInt(row.requests),
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
