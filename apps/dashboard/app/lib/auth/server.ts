import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl:
    process.env.NEON_AUTH_BASE_URL ||
    'https://ep-falling-cell-axrlzm3b.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth',
  cookies: {
    secret:
      process.env.NEON_AUTH_COOKIE_SECRET ||
      'dev-secret-change-me-to-at-least-32-chars-long-please',
  },
});
