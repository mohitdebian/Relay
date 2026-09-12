import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://relayapicloud.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/docs'],
      disallow: ['/overview', '/keys', '/logs', '/settings', '/webhooks', '/apis', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
