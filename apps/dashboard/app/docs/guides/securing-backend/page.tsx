import { DocsToc } from '../../_components/DocsToc';
import { Callout } from '../../_components/Callout';
import CodeCard from '../../_components/CodeCard';

export default function SecuringBackendPage() {
  const middlewareCode = [
    {
      label: 'Express',
      code: (
        <>
          <span className="docs-tok-comment">{'// Add this BEFORE your routes'}</span>
          {'\n'}
          app.<span className="docs-tok-fn">use</span>((req, res, next) {'=> {\n'}
          {'  '}
          <span className="docs-tok-key">if</span> (req.headers[
          <span className="docs-tok-str">&apos;x-relay-signature&apos;</span>] !== process.env.
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
          <span className="docs-tok-comment">{'// Add this BEFORE your routes'}</span>
          {'\n'}
          app.<span className="docs-tok-fn">addHook</span>(
          <span className="docs-tok-str">&apos;onRequest&apos;</span>, async (req, reply){' => {\n'}
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
    {
      label: 'FastAPI',
      code: (
        <>
          <span className="docs-tok-comment">{'# Add this BEFORE your routes'}</span>
          {'\n'}
          <span className="docs-tok-comment">{'@app.middleware("http")'}</span>
          {'\n'}
          <span className="docs-tok-key">async def</span>{' '}
          <span className="docs-tok-fn">verify_relay</span>(request, call_next):{'\n'}
          {'  '}
          <span className="docs-tok-key">if</span> request.headers.get(
          <span className="docs-tok-str">&quot;x-relay-signature&quot;</span>) != os.environ[
          <span className="docs-tok-str">&quot;RELAY_SHARED_SECRET&quot;</span>]:{'\n'}
          {'    '}
          <span className="docs-tok-key">return</span>{' '}
          <span className="docs-tok-fn">JSONResponse</span>(
          <span className="docs-tok-key">403</span>, {'{"'}error{'":'}{' '}
          <span className="docs-tok-str">&quot;Forbidden&quot;</span>
          {'}'}){'\n'}
          {'  '}
          <span className="docs-tok-key">return await</span>{' '}
          <span className="docs-tok-fn">call_next</span>(request)
        </>
      ),
    },
    {
      label: 'Go',
      code: (
        <>
          <span className="docs-tok-comment">{'// Wrap your router with this'}</span>
          {'\n'}
          <span className="docs-tok-key">func</span> <span className="docs-tok-fn">relayOnly</span>
          (next http.Handler) http.Handler {'{\n'}
          {'  '}
          <span className="docs-tok-key">return</span> http.HandlerFunc(
          <span className="docs-tok-key">func</span>(w http.ResponseWriter, r *http.Request) {'{\n'}
          {'    '}
          <span className="docs-tok-key">if</span> r.Header.Get(
          <span className="docs-tok-str">&quot;X-Relay-Signature&quot;</span>) != os.Getenv(
          <span className="docs-tok-str">&quot;RELAY_SHARED_SECRET&quot;</span>) {'{\n'}
          {'      http.Error(w, '}
          <span className="docs-tok-str">{`\`{"error":"Forbidden"}\``}</span>,{' '}
          <span className="docs-tok-key">403</span>){'\n'}
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
    {
      label: 'Django',
      code: (
        <>
          <span className="docs-tok-comment">{'# Add to MIDDLEWARE in settings.py'}</span>
          {'\n'}
          <span className="docs-tok-key">class</span>{' '}
          <span className="docs-tok-fn">RelayMiddleware</span>:{'\n'}
          {'  '}
          <span className="docs-tok-key">def</span> <span className="docs-tok-fn">__init__</span>
          (self, get_response):{'\n'}
          {'    self.get_response = get_response\n\n'}
          {'  '}
          <span className="docs-tok-key">def</span> <span className="docs-tok-fn">__call__</span>
          (self, request):{'\n'}
          {'    '}
          <span className="docs-tok-key">if</span> request.META.get(
          <span className="docs-tok-str">&quot;HTTP_X_RELAY_SIGNATURE&quot;</span>) != os.environ[
          <span className="docs-tok-str">&quot;RELAY_SHARED_SECRET&quot;</span>]:{'\n'}
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

  const envCode = [
    {
      label: '.env',
      code: (
        <>
          <span className="docs-tok-comment">{'# Paste the same secret from Relay Dashboard'}</span>
          {'\n'}
          <span className="docs-tok-key">RELAY_SHARED_SECRET</span>=
          <span className="docs-tok-str">your-secret-here</span>
        </>
      ),
    },
  ];

  const testCode = [
    {
      label: 'Test',
      code: (
        <>
          <span className="docs-tok-comment">{'# ✗ Direct → blocked'}</span>
          {'\n'}
          curl https://api.yourproject.com/users{'\n'}
          <span className="docs-tok-str">{'→ { "error": "Forbidden" }'}</span>
          {'\n\n'}
          <span className="docs-tok-comment">{'# ✓ Through Relay → works'}</span>
          {'\n'}
          curl https://gateway.relay.com/
          <span className="docs-tok-key">your-slug</span>/users \{'\n'}
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
          3 steps to make your backend private. Only requests through Relay get in.
        </p>

        <Callout>
          <strong>How it works:</strong> Relay adds a secret header to every request it forwards.
          Your backend checks that header. No header = rejected. That&apos;s it.
        </Callout>

        <h2 className="docs-h2" id="step-1">
          Step 1 — Copy your shared secret
        </h2>
        <p className="docs-p">
          Relay automatically generates a secure shared secret for your API. You can find it by
          going to <strong>Relay Dashboard → APIs → your API → Settings → Shared Secret</strong>.
        </p>
        <p className="docs-p" style={{ marginBottom: '24px' }}>
          Click the <strong>Copy</strong> button to save it to your clipboard.
        </p>

        <h2 className="docs-h2" id="step-2">
          Step 2 — Add one middleware to your backend
        </h2>
        <p className="docs-p">
          Pick your framework. Copy-paste this <strong>before</strong> your routes:
        </p>

        <CodeCard tabs={middlewareCode} />

        <p className="docs-p">
          Then add the secret to your backend&apos;s <code className="docs-inline">.env</code>:
        </p>

        <CodeCard tabs={envCode} />

        <Callout variant="warn">
          Never commit your secret to git. Use <code className="docs-inline">.env</code> or a
          secrets manager.
        </Callout>

        <h2 className="docs-h2" id="step-3">
          Step 3 — Test it
        </h2>

        <CodeCard tabs={testCode} />

        <p className="docs-p" style={{ marginTop: '16px' }}>
          Direct requests get <strong>403 Forbidden</strong>. Requests through Relay with a valid
          API key go through. Done ✓
        </p>
      </main>

      <aside className="docs-side"></aside>

      <DocsToc
        links={[
          { label: '1. Generate a secret', href: '#step-1' },
          { label: '2. Add middleware', href: '#step-2' },
          { label: '3. Test it', href: '#step-3' },
        ]}
      />
    </>
  );
}
