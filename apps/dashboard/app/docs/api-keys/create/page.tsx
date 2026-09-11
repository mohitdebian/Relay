import { cookies } from 'next/headers';
import { EndpointBadge } from '../../_components/EndpointBadge';
import { ParamsTable, ParamRow } from '../../_components/ParamsTable';
import { Callout } from '../../_components/Callout';
import CodeCard from '../../_components/CodeCard';

export default async function CreateApiKeyPage() {
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
          <span className="docs-tok-comment"># create a production key</span>
          {'\n'}
          curl -X POST {apiUrl}/apis/1/keys \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer {token}"</span> \
          {'\n'}
          {'  '}-H <span className="docs-tok-str">"Content-Type: application/json"</span> \{'\n'}
          {'  '}-d{' '}
          <span className="docs-tok-str">
            '
            {`{
    "name": "CI pipeline",
    "environment": "production"
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
          const response = await fetch('{apiUrl}/apis/1/keys', {'{\n'}
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
          {'    '}name: <span className="docs-tok-str">'CI pipeline'</span>,{'\n'}
          {'    '}environment: <span className="docs-tok-str">'production'</span>
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
          <span className="docs-tok-str">"name"</span>:{' '}
          <span className="docs-tok-str">"CI pipeline"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-str">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>
          {'\n'}
          {'}'}
          {'\n\n'}
          response = requests.post(
          <span className="docs-tok-str">"{apiUrl}/apis/1/keys"</span>, headers=headers,
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
          <span className="docs-tok-key">"apiKey"</span>: {'{'}
          {'\n'}
          {'    '}
          <span className="docs-tok-key">"id"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"CI pipeline"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"created_at"</span>:{' '}
          <span className="docs-tok-str">"2026-09-11T10:42:00Z"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"last_used_at"</span>:{' '}
          <span className="docs-tok-null">null</span>
          {'\n'}
          {'  },'}
          {'\n'}
          {'  '}
          <span className="docs-tok-key">"rawKey"</span>:{' '}
          <span className="docs-tok-str">"relay_live_9f8e7d6c5b4a..."</span>
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
        <div className="docs-h1">Create an API key</div>
        <EndpointBadge method="POST" path="/apis/:id/keys" />

        <div className="docs-lede">
          Creates a new API key scoped to a single environment. Keys are shown in full exactly once
          — store the returned <code className="docs-inline">rawKey</code> immediately.
        </div>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          All requests to the Relay API must include a workspace-level access token in the{' '}
          <code className="docs-inline">Authorization</code> header. This endpoint cannot be called
          with a scoped API key — only a workspace owner or admin token.
        </p>

        <Callout variant="warn">
          <b>Note —</b> the response's <code className="docs-inline">rawKey</code> field is only
          ever returned on creation. Relay does not store or display full key values afterward.
        </Callout>

        <h2 className="docs-h2" id="path-params">
          Path Parameters
        </h2>
        <ParamsTable>
          <ParamRow
            name="id"
            required={true}
            type="integer"
            description="The ID of the API you are creating this key for."
          />
        </ParamsTable>

        <h2 className="docs-h2" id="params">
          Body Parameters
        </h2>
        <ParamsTable>
          <ParamRow
            name="name"
            required={true}
            type="string"
            description='A human-readable label for this key, e.g. "CI pipeline".'
          />
          <ParamRow
            name="environment"
            required={false}
            type="string"
            description={
              <>
                Defaults to <code className="docs-inline">production</code>. One of <code className="docs-inline">production</code>,{' '}
                <code className="docs-inline">staging</code>,{' '}
                <code className="docs-inline">development</code>.
              </>
            }
          />
        </ParamsTable>

        <h2 className="docs-h2" id="response">
          Response
        </h2>
        <p className="docs-p muted">
          Returns the created key object, including the plaintext secret (shown once).
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
