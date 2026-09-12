import { Request, Response, NextFunction } from 'express';
import { redis } from './redis';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests allowed in the window
  keyPrefix: string; // Redis key prefix (e.g., "rl:auth", "rl:api")
  message?: string; // Custom error message
}

/**
 * Sliding-window rate limiter using Redis.
 *
 * How it works:
 * - Each client gets a Redis key based on their IP (or user ID if authenticated)
 * - Uses Redis INCR + EXPIRE for a fixed-window counter
 * - Returns 429 Too Many Requests when limit is exceeded
 * - Sets standard rate-limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyPrefix,
    message = 'Too many requests. Please try again later.',
  } = config;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Identify client: use authenticated user ID if available, then real IP from proxy headers, then direct IP
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : null;
    const clientId = (req as any).user?.id || realIp || req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${clientId}`;

    try {
      // Increment the counter
      const currentCount = await redis.incr(key);

      // Set TTL on first request in the window
      if (currentCount === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Get remaining TTL for the reset header
      const ttl = await redis.ttl(key);
      const resetAt = Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);

      // Set standard rate-limit headers
      res.set({
        'X-RateLimit-Limit': String(maxRequests),
        'X-RateLimit-Remaining': String(Math.max(0, maxRequests - currentCount)),
        'X-RateLimit-Reset': String(resetAt),
      });

      if (currentCount > maxRequests) {
        res.set('Retry-After', String(ttl > 0 ? ttl : windowSeconds));
        res.status(429).json({
          error: message,
          retryAfter: ttl > 0 ? ttl : windowSeconds,
        });
        return;
      }

      next();
    } catch (error) {
      // If Redis is down, let the request through (fail-open)
      // This prevents Redis outages from breaking the entire API
      console.error('Rate limiter error (failing open):', error);
      next();
    }
  };
}

// ---- Pre-configured rate limiters ----

/** Strict limit for auth endpoints (login, register) — prevents brute-force */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 attempts per 15 min
  keyPrefix: 'rl:auth',
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

/** Standard limit for general API routes */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 500, // 500 requests per minute (generous for SSR dashboards)
  keyPrefix: 'rl:api',
  message: 'API rate limit exceeded. Please slow down.',
});

/** Tight limit for sensitive operations (key creation, webhook creation) */
export const sensitiveRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 per minute
  keyPrefix: 'rl:sensitive',
  message: 'Rate limit exceeded for this operation.',
});
