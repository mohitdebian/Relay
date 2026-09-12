import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://relayapicloud.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RELAY_ | Route, secure, and monitor every API',
    template: '%s | RELAY_',
  },
  description:
    'API infrastructure for teams shipping fast — routing, auth, and observability in one place.',
  keywords: [
    'API gateway',
    'API management',
    'rate limiting',
    'developer platform',
    'webhooks',
    'zero-downtime migrations',
  ],
  openGraph: {
    title: 'RELAY_ | Route, secure, and monitor every API',
    description:
      'One dashboard for gateways, keys, rate limits, and traffic — so your team spends less time gluing infrastructure together and more time shipping.',
    url: SITE_URL,
    siteName: 'RELAY_',
    images: [
      {
        url: '/og-image.jpg?v=2',
        width: 1200,
        height: 630,
        alt: 'RELAY_ API Infrastructure',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RELAY_ | API Infrastructure',
    description: 'One dashboard for gateways, keys, rate limits, and traffic.',
    creator: '@relay',
    images: ['/og-image.jpg?v=2'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const dynamic = 'force-dynamic';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
      </body>
    </html>
  );
}
