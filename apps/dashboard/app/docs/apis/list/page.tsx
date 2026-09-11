import { cookies } from 'next/headers';
import { EndpointBadge } from '../../_components/EndpointBadge';
import CodeCard from '../../_components/CodeCard';

export default async function ListApisPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('__Secure-neon-auth.session_token')?.value ||
    cookieStore.get('neon-auth.session_token')?.value ||
    cookieStore.get('better-auth.session_token')?.value ||
    '$RELAY_TOKEN';

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.relay.dev';

  const tabs = [
    {
      label: 'cURL',
      code: (
        <>
          <span className="docs-tok-comment"># list APIs for a workspace</span>
          {'\n'}
          curl -X GET {apiUrl}/apis?workspaceId=1 \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer {token}"</span>
        </>
      ),
    },
  ];

  const responseTabs = [
    {
      label: 'JSON',
      code: (
        <>
          {'{'}
          {'\n'}
          {'  '}
          <span className="docs-tok-key">"apis"</span>: [{'\n'}
          {'    {'}
          {'\n'}
          {'      '}
          <span className="docs-tok-key">"id"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"workspace_id"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"My First API"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"slug"</span>:{' '}
          <span className="docs-tok-str">"my-first-api"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"description"</span>:{' '}
          <span className="docs-tok-str">"Primary production proxy"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"upstream_url"</span>:{' '}
          <span className="docs-tok-str">"https://httpbin.org"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"shared_secret"</span>:{' '}
          <span className="docs-tok-str">"whsec_a1b2c3d4e5f6..."</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"rate_limit_enabled"</span>:{' '}
          <span className="docs-tok-null">true</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"rate_limit_max"</span>:{' '}
          <span className="docs-tok-str">1000</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"rate_limit_window"</span>:{' '}
          <span className="docs-tok-str">3600</span>
          {'\n'}
          {'    }'}
          {'\n  ]'}
          {'\n}'}
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">APIs & Endpoints</div>
        <div className="docs-h1">List APIs</div>
        <EndpointBadge method="GET" path="/apis" />

        <div className="docs-lede">
          Retrieve a list of all API targets configured in your workspace.
        </div>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          Requires a workspace-level access token in the <code className="docs-inline">Authorization</code> header. 
          The <code className="docs-inline">workspaceId</code> must be provided either as a query parameter or via the <code className="docs-inline">x-workspace-id</code> header.
        </p>

        <h2 className="docs-h2" id="response">
          Response
        </h2>
        <p className="docs-p muted">
          Returns an array of API objects containing configuration and upstream mapping details.
        </p>
      </main>

      <aside className="docs-side">
        <CodeCard tabs={tabs} />

        <div className="docs-response-label">Example response · 200 OK</div>
        <CodeCard tabs={responseTabs} />
      </aside>
    </>
  );
}
