import express from 'express';
import request from 'supertest';
import authRoutes from '../auth';

// Mock DB Pool
const mockQuery = jest.fn();
jest.mock('../../db', () => ({
  pool: {
    query: (...args: any[]) => mockQuery(...args),
    connect: jest.fn().mockResolvedValue({
      query: (...args: any[]) => mockQuery(...args),
      release: jest.fn(),
    }),
  },
}));

// Mock Redis rate limiter so tests don't fail due to rate limits
jest.mock('../../utils/redis', () => ({
  redis: {
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(60),
  },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should validate inputs', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'invalid-email' }); // missing password, invalid email
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.issues).toBeDefined();
    });

    it('should return 401 for non-existent user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // User not found

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });
  });

  describe('POST /auth/register', () => {
    it('should block invalid schemas', async () => {
      const res = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'short', // Too short (zod needs 8 chars)
        workspace_name: 'W', // Too short (zod needs 2 chars)
      });
      expect(res.status).toBe(400);
      expect(res.body.issues.length).toBeGreaterThan(0);
    });
  });
});
