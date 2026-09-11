import { cookies } from 'next/headers';
import { EndpointBadge } from '../../_components/EndpointBadge';
import { ParamsTable, ParamRow } from '../../_components/ParamsTable';
import CodeCard from '../../_components/CodeCard';

export default async function ListApisPage() {
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
          <span className="docs-tok-comment"># list all APIs in the workspace</span>
          {'\n'}
          curl -X GET {apiUrl}/apis \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer {token}"</span> \
          {'\n'}
          {'  '}-H <span className="docs-tok-str">"x-workspace-id: {workspaceId}"</span>
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
          {'  '}method: <span className="docs-tok-str">'GET'</span>,{'\n'}
          {'  '}headers: {'{\n'}
          {'    '}
          <span className="docs-tok-str">'Authorization'</span>: <span className="docs-tok-str">'Bearer {token}'</span>,{'\n'}
          {'    '}
          <span className="docs-tok-str">'x-workspace-id'</span>: <span className="docs-tok-str">'{workspaceId}'</span>
          {'\n'}
          {'  }'}
          {'\n'}
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
          <span className="docs-tok-str">"x-workspace-id"</span>: <span className="docs-tok-str">"{workspaceId}"</span>
          {'\n'}
          {'}'}
          {'\n\n'}
          response = requests.get(
          <span className="docs-tok-str">"{apiUrl}/apis"</span>, headers=headers)
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
          <span className="docs-tok-key">"apis"</span>: {'[\n'}
          {'    {\n'}
          {'      '}
          <span className="docs-tok-key">"id"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"workspace_id"</span>:{' '}
          <span className="docs-tok-str">{workspaceId}</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"Payments Service"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"slug"</span>:{' '}
          <span className="docs-tok-str">"payments-service"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"upstream_url"</span>:{' '}
          <span className="docs-tok-str">"https://payments.internal.net"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"status"</span>:{' '}
          <span className="docs-tok-str">"active"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"created_at"</span>:{' '}
          <span className="docs-tok-str">"2026-09-10T12:00:00Z"</span>
          {'\n'}
          {'    }\n'}
          {'  ]'}
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
        <div className="docs-h1">List APIs</div>
        <EndpointBadge method="GET" path="/apis" />

        <div className="docs-lede">
          Returns a list of all configured APIs in the current workspace. The APIs are returned sorted by creation date, with the most recent appearing first.
        </div>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          All requests to the Relay API must include a workspace-level access token in the{' '}
          <code className="docs-inline">Authorization</code> header.
        </p>



        <h2 className="docs-h2" id="response">
          Response
        </h2>
        <p className="docs-p muted">
          Returns an object with an <code className="docs-inline">apis</code> property that contains an array of API objects.
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
