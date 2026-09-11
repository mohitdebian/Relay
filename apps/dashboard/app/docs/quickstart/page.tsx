import { cookies } from 'next/headers';
import CodeCard from '../_components/CodeCard';

export default async function QuickstartPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('__Secure-neon-auth.session_token')?.value ||
    cookieStore.get('neon-auth.session_token')?.value ||
    cookieStore.get('better-auth.session_token')?.value ||
    '$RELAY_TOKEN';

  const workspaceId = cookieStore.get('relay_active_workspace')?.value || '1';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.relay.dev';

  const createApiTabs = [
    {
      label: 'cURL',
      code: (
        <>
          <span className="docs-tok-comment"># Create a new API target in Relay</span>
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
    "name": "My First API",
    "slug": "my-first-api",
    "upstream_url": "https://httpbin.org",
    "environment": "development"
  }`}
            '
          </span>
        </>
      ),
    },
  ];

  const createKeyTabs = [
    {
      label: 'cURL',
      code: (
        <>
          <span className="docs-tok-comment"># Create an API Key for your new API (replace 1 with your API ID)</span>
          {'\n'}
          curl -X POST {apiUrl}/apis/1/keys \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer {token}"</span> \
          {'\n'}
          {'  '}-H <span className="docs-tok-str">"Content-Type: application/json"</span> \{'\n'}
          {'  '}-d{' '}
          <span className="docs-tok-str">
            '
            {`{
    "name": "Dev Key",
    "environment": "development"
  }`}
            '
          </span>
        </>
      ),
    },
  ];

  const sendRequestTabs = [
    {
      label: 'cURL',
      code: (
        <>
          <span className="docs-tok-comment"># Send a request through the Relay Gateway</span>
          {'\n'}
          curl -X GET https://gateway.relay.dev/v1/my-first-api/anything \{'\n'}
          {'  '}-H <span className="docs-tok-str">"Authorization: Bearer relay_live_YOUR_RAW_KEY"</span>
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Getting Started</div>
        <div className="docs-h1">Quickstart</div>

        <div className="docs-lede">
          Get Relay up and running in under 5 minutes. This walkthrough will guide you through creating an API, generating an API key, and sending your first authenticated request through the gateway.
        </div>

        <h2 className="docs-h2" id="create-api">
          1. Create an API
        </h2>
        <p className="docs-p">
          First, register your upstream service with Relay to create a new API target. You must pass your workspace ID and an authentication token in the headers. For more depth on authentication, see the <a href="/docs/authentication" className="docs-link">Authentication</a> guide.
        </p>

        <CodeCard tabs={createApiTabs} />

        <h2 className="docs-h2" id="create-key">
          2. Generate an API Key
        </h2>
        <p className="docs-p">
          Now that you have an API registered, generate an API key to authenticate requests from your clients. Be sure to save the <code className="docs-inline">rawKey</code> returned in the response, as it will never be displayed again. For more details, see the <a href="/docs/api-keys/create" className="docs-link">Create an API key</a> reference.
        </p>

        <CodeCard tabs={createKeyTabs} />

        <h2 className="docs-h2" id="send-request">
          3. Send a Request
        </h2>
        <p className="docs-p">
          Use your newly generated API key to send an authenticated request through the Relay Gateway. The gateway will validate the key, apply rate limits, and proxy the request to your <code className="docs-inline">upstream_url</code>.
        </p>

        <CodeCard tabs={sendRequestTabs} />

        <p className="docs-p">
          Once your request goes through, you will see it logged and categorized in your dashboard.
        </p>
      </main>
      <aside className="docs-side">
        {/* Prose-only page without right rail */}
      </aside>
    </>
  );
}
