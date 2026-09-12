import { pool } from '../db';
import { dispatchWebhook } from '../jobs/webhookWorker';
import { logger } from './logger';
export async function logAuditAction(
  workspaceId: number,
  actorId: number,
  action: string,
  resourceType: string,
  resourceId: number | null = null,
  metadata: any = {}
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_logs (workspace_id, actor_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [workspaceId, actorId, action, resourceType, resourceId, metadata]
    );

    // After logging the action, dispatch webhooks asynchronously
    // We don't await this so it doesn't block the request
    pool
      .query(`SELECT url, secret, events FROM webhooks WHERE workspace_id = $1 AND status = 'active'`, [
        workspaceId,
      ])
      .then((result) => {
        for (const webhook of result.rows) {
          // webhooks.events is a JSON array of strings
          const events = webhook.events || [];
          // If the webhook subscribes to this action or all actions ('*')
          if (events.includes(action) || events.includes('*')) {
            dispatchWebhook(webhook.url, webhook.secret, action, {
              actorId,
              resourceType,
              resourceId,
              metadata,
            }).catch((err) => {
              logger.error({ err }, 'Failed to dispatch webhook to BullMQ');
            });
          }
        }
      })
      .catch((err) => {
        logger.error({ err }, 'Failed to query webhooks for dispatch');
      });
  } catch (error) {
    logger.error({ error }, 'Failed to write audit log');
    // Don't throw - audit logging should not break the main request flow
  }
}
