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

  const workspaceId = cookieStore.get('relay_active_workspace')?.value || 'wksp_your_workspace_id';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.relay.dev';

  const tabs = [
    {
      label: 'cURL',
      code: (
        <>
          <span className="docs-tok-comment"># create a new API proxy</span>
          {'\n'}
          curl -X POST {apiUrl}/apis \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer {token}"</span> \
          {'\n'}
          {'  '}-H <span className="docs-tok-str">"Content-Type: application/json"</span> \{'\n'}
          {'  '}-d{' '}
          <span className="docs-tok-str">
            '
            {`{
    "workspace_id": ${workspaceId},
    "name": "Payments Service",
    "slug": "payments-service",
    "environment": "production",
    "upstream_url": "https://payments.internal.net"
  }`}
            '
          </span>
        </>
      ),
    },
    {
      label: 'JavaScript',
      code: (
        <>
          <span className="docs-tok-comment">{'// using the fetch API'}</span>
          {'\n'}
          const response = await fetch('{apiUrl}/apis', {'{\n'}
          {'  '}method: <span className="docs-tok-str">'POST'</span>,{'\n'}
          {'  '}headers: {'{\n'}
          {'    '}
          <span className="docs-tok-str">'Authorization'</span>: <span className="docs-tok-str">'Bearer {token}'</span>,{'\n'}
          {'    '}
          <span className="docs-tok-str">'Content-Type'</span>:{' '}
          <span className="docs-tok-str">'application/json'</span>
          {'\n'}
          {'  },'}
          {'\n'}
          {'  '}body: JSON.stringify({'{\n'}
          {'    '}workspace_id: <span className="docs-tok-str">{workspaceId}</span>,{'\n'}
          {'    '}name: <span className="docs-tok-str">'Payments Service'</span>,{'\n'}
          {'    '}slug: <span className="docs-tok-str">'payments-service'</span>,{'\n'}
          {'    '}environment: <span className="docs-tok-str">'production'</span>,{'\n'}
          {'    '}upstream_url: <span className="docs-tok-str">'https://payments.internal.net'</span>
          {'\n'}
          {'  })\\n'}
          {'});'}
        </>
      ),
    },
    {
      label: 'Python',
      code: (
        <>
          <span className="docs-tok-comment"># using the requests library</span>
          {'\n'}
          import requests{'\n\n'}
          headers = {'{\n'}
          {'    '}
          <span className="docs-tok-str">"Authorization"</span>: <span className="docs-tok-str">"Bearer {token}"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-str">"Content-Type"</span>:{' '}
          <span className="docs-tok-str">"application/json"</span>
          {'\n'}
          {'}'}
          {'\n\n'}
          data = {'{\n'}
          {'    '}
          <span className="docs-tok-str">"workspace_id"</span>:{' '}
          <span className="docs-tok-str">{workspaceId}</span>,{'\n'}
          {'    '}
          <span className="docs-tok-str">"name"</span>:{' '}
          <span className="docs-tok-str">"Payments Service"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-str">"slug"</span>:{' '}
          <span className="docs-tok-str">"payments-service"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-str">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-str">"upstream_url"</span>:{' '}
          <span className="docs-tok-str">"https://payments.internal.net"</span>
          {'\n'}
          {'}'}
          {'\n\n'}
          response = requests.post(
          <span className="docs-tok-str">"{apiUrl}/apis"</span>, headers=headers,
          json=data)
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
          <span className="docs-tok-str">{workspaceId}</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"Payments Service"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"slug"</span>:{' '}
          <span className="docs-tok-str">"payments-service"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"upstream_url"</span>:{' '}
          <span className="docs-tok-str">"https://payments.internal.net"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"status"</span>:{' '}
          <span className="docs-tok-str">"active"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"created_at"</span>:{' '}
          <span className="docs-tok-str">"2026-09-10T12:00:00Z"</span>
          {'\n'}
          {'  }'}
          {'\n'}
          {'}'}
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">APIs &amp; Endpoints</div>
        <div className="docs-h1">Create an API</div>
        <EndpointBadge method="POST" path="/apis" />

        <div className="docs-lede">
          Creates a new API proxy in the current workspace. Once created, Relay will automatically start proxying traffic for this API.
        </div>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          All requests to the Relay API must include a workspace-level access token in the{' '}
          <code className="docs-inline">Authorization</code> header.
        </p>

        <h2 className="docs-h2" id="params">
          Parameters
        </h2>
        <ParamsTable>
          <ParamRow
            name="workspace_id"
            required={true}
            type="integer"
            description="The ID of the workspace where this API will be created."
          />
          <ParamRow
            name="name"
            required={true}
            type="string"
            description='A human-readable name for this API, e.g. "Payments Service".'
          />
          <ParamRow
            name="slug"
            required={true}
            type="string"
            description='A unique URL-friendly identifier for routing, e.g. "payments-service".'
          />
          <ParamRow
            name="environment"
            required={true}
            type="string"
            description={
              <>
                One of <code className="docs-inline">production</code>,{' '}
                <code className="docs-inline">staging</code>,{' '}
                <code className="docs-inline">development</code>.
              </>
            }
          />
          <ParamRow
            name="upstream_url"
            required={true}
            type="string"
            description="The base URL of your upstream service that Relay should proxy traffic to."
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
