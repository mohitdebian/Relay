import { cookies } from 'next/headers';
import { EndpointBadge } from '../../../_components/EndpointBadge';
import { ParamsTable, ParamRow } from '../../../_components/ParamsTable';
import CodeCard from '../../../_components/CodeCard';

export default async function ListApiKeysPage() {
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
          <span className="docs-tok-comment"># list API keys for a specific API</span>
          {'\n'}
          curl -X GET {apiUrl}/apis/1/keys \{'\n'}
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
          <span className="docs-tok-key">"keys"</span>: [{'\n'}
          {'    {'}
          {'\n'}
          {'      '}
          <span className="docs-tok-key">"id"</span>:{' '}
          <span className="docs-tok-str">12</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"workspace_id"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"api_id"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"CI pipeline"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"key_prefix"</span>:{' '}
          <span className="docs-tok-str">"relay_live_9f8e7d..."</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"environment"</span>:{' '}
          <span className="docs-tok-str">"production"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"created_at"</span>:{' '}
          <span className="docs-tok-str">"2026-09-11T10:42:00.000Z"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"expires_at"</span>:{' '}
          <span className="docs-tok-null">null</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"last_used_at"</span>:{' '}
          <span className="docs-tok-str">"2026-09-11T11:20:00.000Z"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"revoked_at"</span>:{' '}
          <span className="docs-tok-null">null</span>
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
        <div className="docs-breadcrumb">API Keys</div>
        <div className="docs-h1">List API keys</div>
        <EndpointBadge method="GET" path="/apis/:id/keys" />

        <div className="docs-lede">
          Retrieve a list of all API keys associated with a specific API target. 
        </div>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          Requires a workspace-level access token in the <code className="docs-inline">Authorization</code> header. 
          The actual secret value of the keys is masked; only the <code className="docs-inline">key_prefix</code> is returned.
        </p>

        <h2 className="docs-h2" id="path-params">
          Path Parameters
        </h2>
        <ParamsTable>
          <ParamRow
            name="id"
            required={true}
            type="integer"
            description="The ID of the API whose keys you want to list."
          />
        </ParamsTable>

        <h2 className="docs-h2" id="response">
          Response
        </h2>
        <p className="docs-p muted">
          Returns an array of key objects.
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
