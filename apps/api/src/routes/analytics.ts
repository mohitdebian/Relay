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
    // 1. Fetch Aggregated Metrics across all APIs (Current 24h)
    const currentOverviewResult = await pool.query(
      `
      SELECT 
        COUNT(*) as total_requests,
        COALESCE(AVG(latency_ms), 0) as average_latency,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as total_errors
      FROM api_request_logs l
      JOIN apis a ON l.api_id = a.id
      WHERE a.workspace_id = $1 AND l.created_at >= NOW() - INTERVAL '24 HOURS'
    `,
      [workspaceId]
    );

    // 1.5 Fetch Aggregated Metrics (Previous 24h)
    const previousOverviewResult = await pool.query(
      `
      SELECT 
        COUNT(*) as total_requests,
        COALESCE(AVG(latency_ms), 0) as average_latency,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as total_errors
      FROM api_request_logs l
      JOIN apis a ON l.api_id = a.id
      WHERE a.workspace_id = $1 AND l.created_at >= NOW() - INTERVAL '48 HOURS' AND l.created_at < NOW() - INTERVAL '24 HOURS'
    `,
      [workspaceId]
    );

    // 2. Fetch by Endpoint (mocked via upstream_url for now, or just path if available)
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

    const currentReq = parseInt(currentOverviewResult.rows[0].total_requests) || 0;
    const prevReq = parseInt(previousOverviewResult.rows[0].total_requests) || 0;
    const reqDelta = prevReq === 0 ? (currentReq > 0 ? 100 : 0) : ((currentReq - prevReq) / prevReq) * 100;

    const currentErrors = parseInt(currentOverviewResult.rows[0].total_errors) || 0;
    const prevErrors = parseInt(previousOverviewResult.rows[0].total_errors) || 0;
    const currentSuccess = currentReq > 0 ? ((currentReq - currentErrors) / currentReq) * 100 : 0;
    const prevSuccess = prevReq > 0 ? ((prevReq - prevErrors) / prevReq) * 100 : 0;
    const successDelta = currentSuccess - prevSuccess;

    const currentLat = parseFloat(currentOverviewResult.rows[0].average_latency) || 0;
    const prevLat = parseFloat(previousOverviewResult.rows[0].average_latency) || 0;
    const latDelta = prevLat === 0 ? (currentLat > 0 ? 100 : 0) : ((currentLat - prevLat) / prevLat) * 100;

    res.json({
      overview: {
        totalRequests: currentReq,
        averageLatencyMs: Math.round(currentLat),
        totalErrors: currentErrors,
        totalRequestsDelta: Math.round(reqDelta),
        successRateDelta: Math.round(successDelta),
        averageLatencyDelta: Math.round(latDelta),
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

  const parsedWorkspaceId = parseInt(workspaceId, 10);
  const parsedApiId = parseInt(apiId, 10);
  if (isNaN(parsedWorkspaceId) || isNaN(parsedApiId)) {
    res.status(400).json({ error: 'Invalid workspace ID or API ID' });
    return;
  }

  const hasAccess = await checkWorkspaceAccess(userId, parsedWorkspaceId);
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

    // 5. Fetch endpoints
    const endpointsResult = await pool.query(
      `
      SELECT method, path, COUNT(*) as requests,
             COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors,
             COALESCE(AVG(latency_ms), 0) as latency_ms
      FROM api_request_logs
      WHERE api_id = $1
      GROUP BY method, path
      ORDER BY requests DESC
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
      endpoints: endpointsResult.rows.map((row) => ({
        method: row.method,
        path: row.path,
        requests: parseInt(row.requests),
        errors: parseInt(row.errors),
        latency: `${Math.round(parseFloat(row.latency_ms))}ms`,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
