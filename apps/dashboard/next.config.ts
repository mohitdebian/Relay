import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Vercel handles its own output trace, 'standalone' causes missing .nft.json errors during build
  output: process.env.VERCEL === '1' ? undefined : 'standalone',
};

export default nextConfig;
