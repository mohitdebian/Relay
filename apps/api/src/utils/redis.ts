import Redis from 'ioredis';

let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Upstash requires TLS. Often the provided URL uses redis:// or https:// instead of rediss://
if (redisUrl.includes('upstash.io')) {
  if (redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
  } else if (redisUrl.startsWith('https://')) {
    redisUrl = redisUrl.replace('https://', 'rediss://');
  }
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});
