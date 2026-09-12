import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import { pool } from './db';
import { initDb } from './db/init';
import { redis } from './utils/redis';

import workspacesRoutes from './routes/workspaces';
import apisRoutes from './routes/apis';
import apiKeysRoutes from './routes/api-keys';
import workspaceKeysRoutes from './routes/workspace-keys';
import analyticsRoutes from './routes/analytics';
import auditRoutes from './routes/audit';
import webhooksRoutes from './routes/webhooks';
import logsRoutes from './routes/logs';
import invitationsRoutes from './routes/invitations';

const app = express();
const PORT = process.env.PORT || 4000;

app.set('json spaces', 2); // Pretty-print JSON responses

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/workspaces', workspacesRoutes);
app.use('/workspaces', auditRoutes); // Mounts on /workspaces/:id/audit-logs
app.use('/apis', apisRoutes);
app.use('/api-keys', apiKeysRoutes);
app.use('/workspace-keys', workspaceKeysRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/logs', logsRoutes);
app.use('/invitations', invitationsRoutes);

// Check database connection on startup
pool
  .query('SELECT 1')
  .then(async () => {
    logger.info('Connected to PostgreSQL');
    await initDb();
  })
  .catch((err) => logger.error({ err }, 'PostgreSQL connection error'));

// Check Redis connection on startup
redis
  .ping()
  .then(() => logger.info('Connected to Redis'))
  .catch((err) => logger.error({ err }, 'Redis connection error'));

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error');
});

const server = app.listen(PORT, () => {
  logger.info(`Relay API running on port ${PORT}`);
});

// Graceful shutdown to fix EADDRINUSE during tsx watch restarts
const shutdown = () => {
  server.close(() => {
    pool.end();
    redis.quit();
    process.exit(0);
  });
};

process.once('SIGUSR2', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { app, pool, redis };
