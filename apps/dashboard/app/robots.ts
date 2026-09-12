import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/docs'],
      disallow: ['/overview', '/keys', '/logs', '/settings', '/webhooks', '/apis', '/api/'],
    },
    sitemap: 'https://relayapicloud.vercel.app/sitemap.xml',
  };
}
