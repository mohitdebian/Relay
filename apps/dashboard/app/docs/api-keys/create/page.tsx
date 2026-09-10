import { EndpointBadge } from '../../_components/EndpointBadge';
import { ParamsTable, ParamRow } from '../../_components/ParamsTable';
import { Callout } from '../../_components/Callout';
import CodeCard from '../../_components/CodeCard';

export default function CreateApiKeyPage() {
  const tabs = [
    {
      label: 'cURL',
      code: (
        <>
          <span className="docs-tok-comment"># create a production key</span>
          {'\n'}
          curl -X POST https://api.relay.dev/v1/keys \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer $RELAY_TOKEN"</span> \
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
          const response = await fetch('https://api.relay.dev/v1/keys', {'{\n'}
          {'  '}method: <span className="docs-tok-str">'POST'</span>,{'\n'}
          {'  '}headers: {'{\n'}
          {'    '}
          <span className="docs-tok-str">'Authorization'</span>: `Bearer{' '}
          <span className="docs-tok-key">{`\${RELAY_TOKEN}`}</span>`,{'\n'}
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
          <span className="docs-tok-str">"Authorization"</span>: f
          <span className="docs-tok-str">"Bearer {'{RELAY_TOKEN}'}"</span>,{'\n'}
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
          <span className="docs-tok-str">"https://api.relay.dev/v1/keys"</span>, headers=headers,
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
          <span className="docs-tok-key">"id"</span>:{' '}
          <span className="docs-tok-str">"key_8f2a1c"</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"CI pipeline"</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"secret"</span>:{' '}
          <span className="docs-tok-str">"sk_live_9f8e7d6c5b4a..."</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"created_at"</span>:{' '}
          <span className="docs-tok-str">"2026-09-11T10:42:00Z"</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"last_used_at"</span>:{' '}
          <span className="docs-tok-null">null</span>
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
        <EndpointBadge method="POST" path="/v1/keys" />

        <div className="docs-lede">
          Creates a new API key scoped to a single environment. Keys are shown in full exactly once
          — store the returned <code className="docs-inline">secret</code> immediately.
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
          <b>Note —</b> the response's <code className="docs-inline">secret</code> field is only
          ever returned on creation. Relay does not store or display full key values afterward.
        </Callout>

        <h2 className="docs-h2" id="params">
          Parameters
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
            name="scopes"
            type="array"
            description={
              <>
                Permission scopes, e.g.{' '}
                <code className="docs-inline">["read:requests","write:endpoints"]</code>. Defaults
                to full access if omitted.
              </>
            }
          />
          <ParamRow
            name="expires_at"
            type="string · ISO 8601"
            description="Optional expiration timestamp. Keys never expire by default."
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
