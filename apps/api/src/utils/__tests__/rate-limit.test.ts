import express from 'express';
import request from 'supertest';
import { rateLimit } from '../rate-limit';

// Mock Redis
jest.mock('../redis', () => ({
  redis: {
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(60),
  },
}));

import { redis } from '../redis';

describe('Rate Limiter Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    // Trust proxy to mock IP addresses easily in supertest
    app.set('trust proxy', true);

    const limiter = rateLimit({
      windowMs: 60000,
      maxRequests: 2,
      keyPrefix: 'test-limit',
    });

    app.get('/', limiter, (req, res) => {
      res.status(200).json({ success: true });
    });
  });

  it('should allow requests under the limit', async () => {
    (redis.incr as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['x-ratelimit-limit']).toBe('2');
    expect(res.headers['x-ratelimit-remaining']).toBe('1');
  });

  it('should block requests over the limit', async () => {
    (redis.incr as jest.Mock).mockResolvedValue(3);

    const res = await request(app).get('/');
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many requests');
    expect(res.headers['retry-after']).toBe('60');
  });

  it('should fail-open if Redis errors', async () => {
    (redis.incr as jest.Mock).mockRejectedValue(new Error('Redis connection failed'));

    const res = await request(app).get('/');
    // Should let it through if Redis is down
    expect(res.status).toBe(200);
  });
});
