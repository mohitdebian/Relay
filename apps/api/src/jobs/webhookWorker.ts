import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

// Create a queue using the existing Redis connection
export const webhookQueue = new Queue('webhook-queue', {
  connection: redis,
});

interface WebhookPayload {
  url: string;
  event: string;
  data: any;
}

// Create a worker to process jobs from the queue
export const webhookWorker = new Worker(
  'webhook-queue',
  async (job: Job<WebhookPayload>) => {
    const { url, event, data } = job.data;

    logger.info({ jobId: job.id, url, event }, 'Processing webhook job');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Relay-Webhook-Dispatcher/1.0',
        },
        body: JSON.stringify({
          event,
          payload: data,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      logger.info({ jobId: job.id, url }, 'Webhook delivered successfully');
    } catch (error: any) {
      logger.error({ jobId: job.id, url, error: error.message }, 'Failed to deliver webhook');
      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection: redis,
    // Add concurrency to process multiple webhooks in parallel
    concurrency: 5,
  }
);

// Listen to worker events
webhookWorker.on('completed', (job) => {
  logger.debug({ jobId: job.id }, 'Job completed');
});

webhookWorker.on('failed', (job, err) => {
  logger.warn({ jobId: job?.id, error: err.message }, 'Job failed');
});

// Helper function to dispatch a webhook
export async function dispatchWebhook(url: string, event: string, data: any) {
  await webhookQueue.add(
    'dispatch',
    { url, event, data },
    {
      attempts: 5, // Retry up to 5 times
      backoff: {
        type: 'exponential',
        delay: 2000, // Wait 2s, then 4s, 8s, etc.
      },
      removeOnComplete: true, // Keep Redis clean
      removeOnFail: 100, // Keep last 100 failed jobs for debugging
    }
  );
}
