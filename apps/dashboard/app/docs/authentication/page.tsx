import { cookies } from 'next/headers';
import CodeCard from '../_components/CodeCard';
import { Callout } from '../_components/Callout';

export default async function AuthenticationPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('__Secure-neon-auth.session_token')?.value ||
    cookieStore.get('neon-auth.session_token')?.value ||
    cookieStore.get('better-auth.session_token')?.value ||
    '$RELAY_TOKEN';

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.relay.dev';

  const requestTabs = [
    {
      label: 'cURL',
      code: (
        <>
          <span className="docs-tok-comment"># Authenticating with the Relay Management API</span>
          {'\n'}
          curl -X GET {apiUrl}/apis \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer {token}"</span> \{'\n'}
          {'  '}-H <span className="docs-tok-str">"x-workspace-id: 1"</span>
        </>
      ),
    },
  ];

  const errorTabs = [
    {
      label: 'JSON',
      code: (
        <>
          {'{'}
          {'\n'}
          {'  '}
          <span className="docs-tok-key">"error"</span>:{' '}
          <span className="docs-tok-str">"Unauthorized: No token provided"</span>
          {'\n'}
          {'}'}
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Getting Started</div>
        <div className="docs-h1">Authentication</div>

        <div className="docs-lede">
          Learn how to authenticate requests to the Relay Management API.
        </div>

        <Callout variant="neutral">
          <b>Note —</b> This page covers authentication for the <b>Management API</b> (creating
          APIs, generating keys, etc.). It does <b>not</b> cover how client requests authenticate
          through the Relay Gateway to your upstream services (which use API keys).
        </Callout>

        <h2 className="docs-h2" id="bearer-tokens">
          Bearer Tokens
        </h2>
        <p className="docs-p">
          Requests to the Relay Management API are authenticated using a{' '}
          <code className="docs-inline">Bearer</code> token provided in the{' '}
          <code className="docs-inline">Authorization</code> header. The token is a JWT (JSON Web
          Token) issued by the authentication provider (e.g., Neon Auth).
        </p>
        <p className="docs-p">
          Most management endpoints also require a workspace context to ensure you have the correct
          permissions (e.g., <code className="docs-inline">admin</code> or{' '}
          <code className="docs-inline">owner</code>). You can provide this context using the{' '}
          <code className="docs-inline">x-workspace-id</code> HTTP header, or as a query parameter{' '}
          <code className="docs-inline">?workspaceId=...</code>.
        </p>

        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <div className="docs-response-label">Example request</div>
          <CodeCard tabs={requestTabs} />
        </div>

        <h2 className="docs-h2" id="unauthorized-errors">
          Unauthorized Errors
        </h2>
        <p className="docs-p">
          If authentication fails, the API will return a{' '}
          <code className="docs-inline">401 Unauthorized</code> response. The JSON body will include
          an <code className="docs-inline">error</code> field describing the reason.
        </p>

        <p className="docs-p">Common 401 error messages include:</p>
        <ul className="docs-ul">
          <li>
            <code className="docs-inline">Unauthorized: No token provided</code> - The Authorization
            header was missing.
          </li>
          <li>
            <code className="docs-inline">Unauthorized: Invalid token</code> - The JWT signature was
            invalid or expired.
          </li>
          <li>
            <code className="docs-inline">Unauthorized: Invalid session</code> - The session cache
            lookup failed.
          </li>
          <li>
            <code className="docs-inline">Unauthorized: Token missing email or sub</code> - The
            token payload was malformed.
          </li>
        </ul>

        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <div className="docs-response-label">Example error response · 401 Unauthorized</div>
          <CodeCard tabs={errorTabs} />
        </div>
      </main>
      <aside className="docs-side">{/* Prose-only page without right rail */}</aside>
    </>
  );
}
