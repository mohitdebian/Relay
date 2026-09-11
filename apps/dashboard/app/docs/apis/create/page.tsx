import { cookies } from 'next/headers';
import { EndpointBadge } from '../../_components/EndpointBadge';
import { ParamsTable, ParamRow } from '../../_components/ParamsTable';
import CodeCard from '../../_components/CodeCard';

export default async function CreateApiPage() {
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
          <span className="docs-tok-comment"># create a new API proxy target</span>
          {'\n'}
          curl -X POST {apiUrl}/apis \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer {token}"</span> \
          {'\n'}
          {'  '}-H <span className="docs-tok-str">"Content-Type: application/json"</span> \{'\n'}
          {'  '}-d{' '}
          <span className="docs-tok-str">
            '
            {`{
    "workspace_id": 1,
    "name": "My First API",
    "slug": "my-first-api",
    "upstream_url": "https://httpbin.org",
    "environment": "production",
    "rate_limit_enabled": true,
    "rate_limit_max": 1000,
    "rate_limit_window": "1h"
  }`}
            '
          </span>
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
          <span className="docs-tok-key">"api"</span>: {'{'}
          {'\n'}
          {'    '}
          <span className="docs-tok-key">"id"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"workspace_id"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"My First API"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"slug"</span>:{' '}
          <span className="docs-tok-str">"my-first-api"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"description"</span>:{' '}
          <span className="docs-tok-null">null</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"upstream_url"</span>:{' '}
          <span className="docs-tok-str">"https://httpbin.org"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"shared_secret"</span>:{' '}
          <span className="docs-tok-null">null</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"rate_limit_enabled"</span>:{' '}
          <span className="docs-tok-null">true</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"rate_limit_max"</span>:{' '}
          <span className="docs-tok-str">1000</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"rate_limit_window"</span>:{' '}
          <span className="docs-tok-str">"1h"</span>
          {'\n'}
          {'  }'}
          {'\n}'}
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">APIs & Endpoints</div>
        <div className="docs-h1">Create an API</div>
        <EndpointBadge method="POST" path="/apis" />

        <div className="docs-lede">
          Register a new upstream service as a proxy target in Relay.
        </div>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          Requires a workspace-level access token in the <code className="docs-inline">Authorization</code> header.
        </p>

        <h2 className="docs-h2" id="params">
          Body Parameters
        </h2>
        <ParamsTable>
          <ParamRow
            name="workspace_id"
            required={true}
            type="integer"
            description="The ID of the workspace this API belongs to."
          />
          <ParamRow
            name="name"
            required={true}
            type="string"
            description='A human-readable label for this API.'
          />
          <ParamRow
            name="slug"
            required={true}
            type="string"
            description="A unique URL-friendly identifier for routing requests."
          />
          <ParamRow
            name="upstream_url"
            required={true}
            type="string"
            description="The base URL of your actual backend service."
          />
          <ParamRow
            name="environment"
            required={false}
            type="string"
            description={
              <>
                Defaults to <code className="docs-inline">development</code>. Can also be <code className="docs-inline">staging</code> or <code className="docs-inline">production</code>.
              </>
            }
          />
          <ParamRow
            name="description"
            required={false}
            type="string"
            description="Optional details about this API target."
          />
          <ParamRow
            name="rate_limit_enabled"
            required={false}
            type="boolean"
            description="Whether to enforce rate limits on requests through the gateway."
          />
          <ParamRow
            name="rate_limit_max"
            required={false}
            type="integer"
            description="Maximum number of requests allowed per window (if enabled)."
          />
          <ParamRow
            name="rate_limit_window"
            required={false}
            type="string"
            description="Window duration string (e.g. 1m, 1h)."
          />
        </ParamsTable>

        <h2 className="docs-h2" id="response">
          Response
        </h2>
        <p className="docs-p muted">
          Returns the created API object.
        </p>
      </main>

      <aside className="docs-side">
        <CodeCard tabs={tabs} />

        <div className="docs-response-label">Example response · 201 Created</div>
        <CodeCard tabs={responseTabs} />
      </aside>
    </>
  );
}
