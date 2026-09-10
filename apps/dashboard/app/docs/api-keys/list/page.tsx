import { cookies } from 'next/headers';
import { EndpointBadge } from '../../_components/EndpointBadge';
import { ParamsTable, ParamRow } from '../../_components/ParamsTable';
import CodeCard from '../../_components/CodeCard';

export default async function ListKeysPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('__Secure-neon-auth.session_token')?.value ||
    cookieStore.get('neon-auth.session_token')?.value ||
    cookieStore.get('better-auth.session_token')?.value ||
    '$RELAY_TOKEN';

  const workspaceId = cookieStore.get('relay_active_workspace')?.value || 'wksp_your_workspace_id';

  const tabs = [
    {
      label: 'cURL',
      code: (
        <>
          <span className="docs-tok-comment"># list all keys in the workspace</span>
          {'\n'}
          curl -X GET https://api.relay.dev/v1/keys \{'\n'}
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
          const response = await fetch('https://api.relay.dev/v1/keys', {'{\n'}
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
          <span className="docs-tok-str">"https://api.relay.dev/v1/keys"</span>, headers=headers)
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
          <span className="docs-tok-key">"object"</span>:{' '}
          <span className="docs-tok-str">"list"</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"data"</span>: {'[\n'}
          {'    {\n'}
          {'      '}
          <span className="docs-tok-key">"id"</span>:{' '}
          <span className="docs-tok-str">"key_8f2a1c"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"CI pipeline"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"key_prefix"</span>:{' '}
          <span className="docs-tok-str">"sk_live_9f8e7d"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"created_at"</span>:{' '}
          <span className="docs-tok-str">"2026-09-11T10:42:00Z"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"last_used_at"</span>:{' '}
          <span className="docs-tok-null">null</span>
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
        <div className="docs-breadcrumb">API Keys</div>
        <div className="docs-h1">List API keys</div>
        <EndpointBadge method="GET" path="/v1/keys" />

        <div className="docs-lede">
          Returns a list of all API keys in the current workspace. Keys are returned sorted by creation date, with the most recent keys appearing first.
        </div>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          All requests to the Relay API must include a workspace-level access token in the{' '}
          <code className="docs-inline">Authorization</code> header.
        </p>

        <h2 className="docs-h2" id="params">
          Query Parameters
        </h2>
        <ParamsTable>
          <ParamRow
            name="limit"
            type="integer"
            description="A limit on the number of objects to be returned, between 1 and 100. Defaults to 50."
          />
          <ParamRow
            name="environment"
            type="string"
            description={
              <>
                Filter keys by environment (e.g. <code className="docs-inline">production</code>,{' '}
                <code className="docs-inline">staging</code>).
              </>
            }
          />
        </ParamsTable>

        <h2 className="docs-h2" id="response">
          Response
        </h2>
        <p className="docs-p muted">
          Returns a dictionary with a <code className="docs-inline">data</code> property that contains an array of key objects. Full secrets are never returned.
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
