import { cookies } from 'next/headers';
import { EndpointBadge } from '../../../_components/EndpointBadge';
import { ParamsTable, ParamRow } from '../../../_components/ParamsTable';
import { Callout } from '../../../_components/Callout';
import CodeCard from '../../../_components/CodeCard';

export default async function RevokeApiKeyPage() {
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
          <span className="docs-tok-comment"># revoke an API key by its unique ID</span>
          {'\n'}
          curl -X DELETE {apiUrl}/api-keys/12 \{'\n'}
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
          <span className="docs-tok-key">"message"</span>:{' '}
          <span className="docs-tok-str">"API key revoked successfully"</span>
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
        <div className="docs-h1">Revoke API key</div>
        <EndpointBadge method="DELETE" path="/api-keys/:id" />

        <div className="docs-lede">
          Immediately revoke an API key. 
        </div>

        <Callout variant="warn">
          <b>Note —</b> Revocation performs a soft-delete by setting the <code className="docs-inline">revoked_at</code> timestamp. 
          The key will immediately be rejected by the gateway for any new incoming requests. In-flight requests are not explicitly halted.
        </Callout>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          Requires a workspace-level access token in the <code className="docs-inline">Authorization</code> header. 
          Additionally, this endpoint requires the user to have an <code className="docs-inline">admin</code> or <code className="docs-inline">owner</code> role in the workspace.
        </p>

        <h2 className="docs-h2" id="path-params">
          Path Parameters
        </h2>
        <ParamsTable>
          <ParamRow
            name="id"
            required={true}
            type="integer"
            description="The unique ID of the API key you want to revoke."
          />
        </ParamsTable>

        <h2 className="docs-h2" id="response">
          Response
        </h2>
        <p className="docs-p muted">
          Returns a success message upon revocation.
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
