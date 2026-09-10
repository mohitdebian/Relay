import { cookies } from 'next/headers';
import { EndpointBadge } from '../../_components/EndpointBadge';
import { ParamsTable, ParamRow } from '../../_components/ParamsTable';
import CodeCard from '../../_components/CodeCard';

export default async function RevokeKeyPage() {
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
          <span className="docs-tok-comment"># revoke an API key by ID</span>
          {'\n'}
          curl -X DELETE https://api.relay.dev/v1/keys/key_8f2a1c \{'\n'}
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
          const response = await fetch('https://api.relay.dev/v1/keys/key_8f2a1c', {'{\n'}
          {'  '}method: <span className="docs-tok-str">'DELETE'</span>,{'\n'}
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
          response = requests.delete(
          <span className="docs-tok-str">"https://api.relay.dev/v1/keys/key_8f2a1c"</span>, headers=headers)
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
          <span className="docs-tok-key">"deleted"</span>:{' '}
          <span className="docs-tok-str">true</span>
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
        <div className="docs-h1">Revoke an API key</div>
        <EndpointBadge method="DELETE" path="/v1/keys/:id" />

        <div className="docs-lede">
          Permanently deletes an API key. It cannot be undone, and any subsequent requests made with this key will immediately fail with a 401 Unauthorized status.
        </div>

        <h2 className="docs-h2" id="auth">
          Authentication
        </h2>
        <p className="docs-p">
          All requests to the Relay API must include a workspace-level access token in the{' '}
          <code className="docs-inline">Authorization</code> header.
        </p>

        <h2 className="docs-h2" id="params">
          Path Parameters
        </h2>
        <ParamsTable>
          <ParamRow
            name="id"
            required={true}
            type="string"
            description="The unique identifier of the API key to revoke."
          />
        </ParamsTable>

        <h2 className="docs-h2" id="response">
          Response
        </h2>
        <p className="docs-p muted">
          Returns an object confirming deletion.
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
