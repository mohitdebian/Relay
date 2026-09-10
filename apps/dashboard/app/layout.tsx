import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RELAY_',
  description: 'API Gateway & Developer Platform',
};

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
