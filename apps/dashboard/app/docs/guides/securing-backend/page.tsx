import { DocsToc } from '../../_components/DocsToc';
import { Callout } from '../../_components/Callout';
import CodeCard from '../../_components/CodeCard';

export default function SecuringBackendPage() {
  const flowDiagram = [
    {
      label: 'Request flow',
      code: (
        <>
          <span className="docs-tok-comment">{'# How Relay protects your backend'}</span>
          {'\n\n'}
          <span className="docs-tok-key">Developer</span>
          {'  →  '}
          <span className="docs-tok-str">Relay Gateway</span>
          {'  →  '}
          <span className="docs-tok-key">Your Backend</span>
          {'\n'}
          {'(API Key)      (validates key,       (checks X-Relay-Signature,\n'}
          {'                strips it,            rejects everything else)\n'}
          {'                adds signature)\n'}
        </>
      ),
    },
  ];

  const step1Dashboard = [
    {
      label: 'Dashboard',
      code: (
        <>
          <span className="docs-tok-comment">{'# In the Relay Dashboard:'}</span>
          {'\n\n'}
          {'1. Go to '}
          <span className="docs-tok-str">APIs</span>
          {' → click your API\n'}
          {'2. Open the '}
          <span className="docs-tok-str">Settings</span>
          {' tab\n'}
          {'3. Set a '}
          <span className="docs-tok-key">Shared Secret</span>
          {' (e.g. a long random string)\n'}
          {'4. Save changes\n\n'}
          <span className="docs-tok-comment">{'# Tip: generate a strong secret with:'}</span>
          {'\n'}
          {'openssl rand -hex 32'}
        </>
      ),
    },
  ];

  const expressCode = [
    {
      label: 'Express',
      code: (
        <>
          <span className="docs-tok-key">const</span> express ={' '}
          <span className="docs-tok-fn">require</span>(
          <span className="docs-tok-str">&apos;express&apos;</span>);{'\n'}
          <span className="docs-tok-key">const</span> app ={' '}
          <span className="docs-tok-fn">express</span>();{'\n\n'}
          <span className="docs-tok-comment">
            {'// Reject any request not coming through Relay'}
          </span>
          {'\n'}
          app.<span className="docs-tok-fn">use</span>((req, res, next) {'=> {\n'}
          {'  '}
          <span className="docs-tok-key">const</span> signature = req.headers[
          <span className="docs-tok-str">&apos;x-relay-signature&apos;</span>];{'\n'}
          {'  '}
          <span className="docs-tok-key">if</span> (signature !== process.env.
          <span className="docs-tok-key">RELAY_SHARED_SECRET</span>) {'{\n'}
          {'    '}
          <span className="docs-tok-key">return</span> res.status(
          <span className="docs-tok-key">403</span>).json({'{ '}error:{' '}
          <span className="docs-tok-str">&apos;Forbidden&apos;</span>
          {' }'});{'\n'}
          {'  }\n'}
          {'  '}
          <span className="docs-tok-fn">next</span>();{'\n'}
          {'});'}
        </>
      ),
    },
    {
      label: 'Fastify',
      code: (
        <>
          <span className="docs-tok-key">import</span> Fastify{' '}
          <span className="docs-tok-key">from</span>{' '}
          <span className="docs-tok-str">&apos;fastify&apos;</span>;{'\n'}
          <span className="docs-tok-key">const</span> app ={' '}
          <span className="docs-tok-fn">Fastify</span>();{'\n\n'}
          app.<span className="docs-tok-fn">addHook</span>(
          <span className="docs-tok-str">&apos;onRequest&apos;</span>, async (req, reply){' =>'}
          {' {\n'}
          {'  '}
          <span className="docs-tok-key">if</span> (req.headers[
          <span className="docs-tok-str">&apos;x-relay-signature&apos;</span>] !== process.env.
          <span className="docs-tok-key">RELAY_SHARED_SECRET</span>) {'{\n'}
          {'    '}reply.code(<span className="docs-tok-key">403</span>).send({'{ '}error:{' '}
          <span className="docs-tok-str">&apos;Forbidden&apos;</span>
          {' }'});{'\n'}
          {'  }\n'}
          {'});'}
        </>
      ),
    },
  ];

  const fastapiCode = [
    {
      label: 'FastAPI',
      code: (
        <>
          <span className="docs-tok-key">import</span> os{'\n'}
          <span className="docs-tok-key">from</span> fastapi{' '}
          <span className="docs-tok-key">import</span> FastAPI, Request{'\n'}
          <span className="docs-tok-key">from</span> fastapi.responses{' '}
          <span className="docs-tok-key">import</span> JSONResponse{'\n\n'}
          app = <span className="docs-tok-fn">FastAPI</span>(){'\n\n'}
          <span className="docs-tok-comment">{'@app.middleware("http")'}</span>
          {'\n'}
          <span className="docs-tok-key">async def</span>{' '}
          <span className="docs-tok-fn">verify_relay</span>(request: Request, call_next):
          {'\n'}
          {'  secret = request.headers.get('}
          <span className="docs-tok-str">&quot;x-relay-signature&quot;</span>){'\n'}
          {'  '}
          <span className="docs-tok-key">if</span> secret != os.environ[
          <span className="docs-tok-str">&quot;RELAY_SHARED_SECRET&quot;</span>]:{'\n'}
          {'    '}
          <span className="docs-tok-key">return</span>{' '}
          <span className="docs-tok-fn">JSONResponse</span>(status_code=
          <span className="docs-tok-key">403</span>, content={'{"'}error{'":'}{' '}
          <span className="docs-tok-str">&quot;Forbidden&quot;</span>
          {'}'}){'\n'}
          {'  '}
          <span className="docs-tok-key">return await</span>{' '}
          <span className="docs-tok-fn">call_next</span>(request)
        </>
      ),
    },
    {
      label: 'Django',
      code: (
        <>
          <span className="docs-tok-comment">{'# middleware.py'}</span>
          {'\n'}
          <span className="docs-tok-key">import</span> os{'\n'}
          <span className="docs-tok-key">from</span> django.http{' '}
          <span className="docs-tok-key">import</span> JsonResponse{'\n\n'}
          <span className="docs-tok-key">class</span>{' '}
          <span className="docs-tok-fn">RelayMiddleware</span>:{'\n'}
          {'  '}
          <span className="docs-tok-key">def</span> <span className="docs-tok-fn">__init__</span>
          (self, get_response):{'\n'}
          {'    self.get_response = get_response\n\n'}
          {'  '}
          <span className="docs-tok-key">def</span> <span className="docs-tok-fn">__call__</span>
          (self, request):{'\n'}
          {'    sig = request.META.get('}
          <span className="docs-tok-str">&quot;HTTP_X_RELAY_SIGNATURE&quot;</span>){'\n'}
          {'    '}
          <span className="docs-tok-key">if</span> sig != os.environ.get(
          <span className="docs-tok-str">&quot;RELAY_SHARED_SECRET&quot;</span>):{'\n'}
          {'      '}
          <span className="docs-tok-key">return</span>{' '}
          <span className="docs-tok-fn">JsonResponse</span>({'{"'}error{'":'}{' '}
          <span className="docs-tok-str">&quot;Forbidden&quot;</span>
          {'}'}, status=<span className="docs-tok-key">403</span>){'\n'}
          {'    '}
          <span className="docs-tok-key">return</span> self.get_response(request)
        </>
      ),
    },
  ];

  const goCode = [
    {
      label: 'Go',
      code: (
        <>
          <span className="docs-tok-key">func</span> <span className="docs-tok-fn">relayOnly</span>
          (next http.Handler) http.Handler {'{\n'}
          {'  '}
          <span className="docs-tok-key">return</span> http.HandlerFunc(
          <span className="docs-tok-key">func</span>(w http.ResponseWriter, r *http.Request) {'{\n'}
          {'    sig := r.Header.Get('}
          <span className="docs-tok-str">&quot;X-Relay-Signature&quot;</span>){'\n'}
          {'    '}
          <span className="docs-tok-key">if</span> sig != os.Getenv(
          <span className="docs-tok-str">&quot;RELAY_SHARED_SECRET&quot;</span>) {'{\n'}
          {'      w.WriteHeader('}
          <span className="docs-tok-key">403</span>){'\n'}
          {'      w.Write([]byte('}
          <span className="docs-tok-str">{`\`{"error":"Forbidden"}\``}</span>)){'\n'}
          {'      '}
          <span className="docs-tok-key">return</span>
          {'\n'}
          {'    }\n'}
          {'    next.ServeHTTP(w, r)\n'}
          {'  })\n'}
          {'}'}
        </>
      ),
    },
  ];

  const envCode = [
    {
      label: '.env',
      code: (
        <>
          <span className="docs-tok-comment">{'# Add to your backend .env file'}</span>
          {'\n'}
          <span className="docs-tok-key">RELAY_SHARED_SECRET</span>=
          <span className="docs-tok-str">your-secret-from-relay-dashboard</span>
        </>
      ),
    },
  ];

  const curlCode = [
    {
      label: 'Test',
      code: (
        <>
          <span className="docs-tok-comment">{'# ✗ Direct request → rejected'}</span>
          {'\n'}
          curl https://api.yourproject.com/users{'\n'}
          <span className="docs-tok-str">{'→ { "error": "Forbidden" }'}</span>
          {'\n\n'}
          <span className="docs-tok-comment">{'# ✓ Through Relay → works'}</span>
          {'\n'}
          curl https://gateway.relay.com/
          <span className="docs-tok-key">your-api-slug</span>/users \{'\n'}
          {'  -H '}
          <span className="docs-tok-str">&quot;X-Api-Key: relay_sk_...&quot;</span>
          {'\n'}
          <span className="docs-tok-str">{'→ { "users": [...] }'}</span>
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Guides</div>
        <h1 className="docs-h1">Securing Your Backend</h1>

        <p className="docs-lede">
          Lock down your backend so only requests through Relay are accepted. No one can bypass your
          API gateway — not even your own developers calling the backend directly.
        </p>

        <h2 className="docs-h2" id="how-it-works">
          How It Works
        </h2>
        <p className="docs-p">
          When Relay proxies a request to your backend, it strips the consumer&apos;s API key and
          injects a <code className="docs-inline">X-Relay-Signature</code> header containing your
          Shared Secret. Your backend checks this header — if it&apos;s missing or wrong, the
          request is rejected.
        </p>

        <CodeCard tabs={flowDiagram} />

        <Callout>
          This means your backend only needs to check <strong>one header</strong>. Relay handles all
          key validation, rate limiting, and logging on its side.
        </Callout>

        <h2 className="docs-h2" id="step-1">
          Step 1: Set a Shared Secret
        </h2>
        <p className="docs-p">
          Generate a strong random secret and set it in the Relay Dashboard on your API&apos;s
          Settings page.
        </p>

        <CodeCard tabs={step1Dashboard} />

        <h2 className="docs-h2" id="step-2">
          Step 2: Add One Middleware
        </h2>
        <p className="docs-p">
          Add a single middleware to your backend that verifies the{' '}
          <code className="docs-inline">X-Relay-Signature</code> header matches your secret. Pick
          your framework below:
        </p>

        <h3
          className="docs-h2"
          id="nodejs"
          style={{ fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}
        >
          Node.js
        </h3>
        <CodeCard tabs={expressCode} />

        <h3
          className="docs-h2"
          id="python"
          style={{ fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}
        >
          Python
        </h3>
        <CodeCard tabs={fastapiCode} />

        <h3
          className="docs-h2"
          id="go"
          style={{ fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}
        >
          Go
        </h3>
        <CodeCard tabs={goCode} />

        <h2 className="docs-h2" id="step-3">
          Step 3: Set the Environment Variable
        </h2>
        <p className="docs-p">
          Add the same secret to your backend&apos;s environment. This must match exactly what you
          entered in the Relay Dashboard.
        </p>

        <CodeCard tabs={envCode} />

        <Callout variant="warn">
          Never commit your shared secret to version control. Use environment variables or a secrets
          manager like Vault, AWS Secrets Manager, or Doppler.
        </Callout>

        <h2 className="docs-h2" id="step-4">
          Step 4: Verify It Works
        </h2>
        <p className="docs-p">
          Test that direct requests are blocked and requests through Relay work correctly:
        </p>

        <CodeCard tabs={curlCode} />

        <h2 className="docs-h2" id="what-relay-sends">
          What Relay Sends to Your Backend
        </h2>
        <p className="docs-p">
          When a request passes through the gateway, Relay modifies the following headers before
          forwarding to your upstream:
        </p>

        <div className="docs-table-container" style={{ marginBottom: '24px' }}>
          <div className="docs-table-row header" style={{ gridTemplateColumns: '200px 1fr' }}>
            <span>Header</span>
            <span>Description</span>
          </div>
          <div className="docs-table-row" style={{ gridTemplateColumns: '200px 1fr' }}>
            <span className="docs-table-cell-mono">X-Relay-Signature</span>
            <span className="docs-table-cell-muted">
              Your shared secret — verify this to lock down your backend
            </span>
          </div>
          <div className="docs-table-row" style={{ gridTemplateColumns: '200px 1fr' }}>
            <span className="docs-table-cell-mono">X-Relay-Api-Id</span>
            <span className="docs-table-cell-muted">The numeric ID of the API in Relay</span>
          </div>
          <div className="docs-table-row" style={{ gridTemplateColumns: '200px 1fr' }}>
            <span className="docs-table-cell-mono">X-Forwarded-For</span>
            <span className="docs-table-cell-muted">The original client IP address</span>
          </div>
          <div className="docs-table-row" style={{ gridTemplateColumns: '200px 1fr' }}>
            <span className="docs-table-cell-mono" style={{ color: 'var(--red)' }}>
              X-Api-Key
            </span>
            <span className="docs-table-cell-muted">
              <strong style={{ color: 'var(--red)' }}>Removed</strong> — Relay strips the consumer
              key before forwarding
            </span>
          </div>
        </div>

        <h2 className="docs-h2" id="team-access">
          Giving Your Team Access
        </h2>
        <p className="docs-p">
          Once your backend only accepts traffic through Relay, give each developer their own API
          key:
        </p>

        <ol
          className="docs-ul"
          style={{
            paddingLeft: '20px',
            marginBottom: '14px',
            fontSize: '15px',
            color: 'var(--text)',
            lineHeight: '1.85',
          }}
        >
          <li style={{ marginBottom: '6px' }}>
            <strong>Invite them</strong> to your workspace under{' '}
            <code className="docs-inline">Members</code>
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Create one API key per developer</strong> on the API detail page (e.g.{' '}
            <code className="docs-inline">alice-dev</code>,{' '}
            <code className="docs-inline">bob-dev</code>)
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Share the gateway URL</strong> — developers call{' '}
            <code className="docs-inline">
              {'https://gateway.relay.com/{api-slug}/your-endpoint'}
            </code>
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Revoke instantly</strong> if someone leaves — their key stops working, everyone
            else is unaffected
          </li>
        </ol>

        <Callout>
          Each developer&apos;s requests appear in <strong>Logs</strong> and{' '}
          <strong>Analytics</strong> tagged with their key name, so you always know who made what
          request.
        </Callout>
      </main>

      <aside className="docs-side"></aside>

      <DocsToc
        links={[
          { label: 'How It Works', href: '#how-it-works' },
          { label: '1. Set a Shared Secret', href: '#step-1' },
          { label: '2. Add One Middleware', href: '#step-2' },
          { label: 'Node.js', href: '#nodejs' },
          { label: 'Python', href: '#python' },
          { label: 'Go', href: '#go' },
          { label: '3. Set Environment Variable', href: '#step-3' },
          { label: '4. Verify It Works', href: '#step-4' },
          { label: 'Headers Relay Sends', href: '#what-relay-sends' },
          { label: 'Giving Your Team Access', href: '#team-access' },
        ]}
      />
    </>
  );
}
