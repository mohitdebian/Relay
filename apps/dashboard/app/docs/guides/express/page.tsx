import { DocsToc } from '../../_components/DocsToc';
import CodeCard from '../../_components/CodeCard';

export default function ExpressGuidePage() {
  const proxyCode = [
    {
      label: 'Express',
      code: (
        <>
          <span className="docs-tok-comment">{`// Enable if you're behind a reverse proxy (like Relay)`}</span>
          {'\n'}
          app.set(<span className="docs-tok-str">'trust proxy'</span>,{' '}
          <span className="docs-tok-key">true</span>);
        </>
      ),
    },
  ];

  const middlewareCode = [
    {
      label: 'Middleware',
      code: (
        <>
          <span className="docs-tok-comment">{`// Middleware to ensure requests come from Relay`}</span>
          {'\n'}
          <span className="docs-tok-key">const</span> relayOnly = (req, res, next) {'=>'} {'{\n'}
          {'  '}
          <span className="docs-tok-comment">{`// Relay sets this header when forwarding requests`}</span>
          {'\n'}
          {'  '}
          <span className="docs-tok-key">const</span> clientIp = req.headers[
          <span className="docs-tok-str">'x-relay-client-ip'</span>];{'\n'}
          {'  '}
          <span className="docs-tok-key">const</span> forwardedFor = req.headers[
          <span className="docs-tok-str">'x-forwarded-for'</span>];{'\n\n'}
          {'  '}
          <span className="docs-tok-key">if</span> (!clientIp && !forwardedFor) {'{\n'}
          {'    '}
          <span className="docs-tok-key">return</span> res.status(403).json({'{'} error:{' '}
          <span className="docs-tok-str">'Direct access forbidden'</span> {'}'});{'\n'}
          {'  }\n'}
          {'  '}next();{'\n'}
          {'}'};{'\n\n'}
          app.use(relayOnly);
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Guides</div>
        <h1 className="docs-h1">Express Backend Configuration</h1>

        <p className="docs-lede">Configure your Express backend to trust Relay edge limits.</p>

        <h2 className="docs-h2" id="trust-proxy">
          Trusting Proxies
        </h2>
        <p className="docs-p">
          Because Relay sits between your users and your backend, your Express application will see
          the request as coming from Relay's IP address rather than the original client's IP. To
          ensure rate limiting and IP-based logic works correctly on your end (if needed), you must
          configure Express to trust the proxy.
        </p>
        <p className="docs-p">Add the following configuration to your Express app:</p>

        <CodeCard tabs={proxyCode} />

        <h2 className="docs-h2" id="client-ips">
          Handling Client IPs
        </h2>
        <p className="docs-p">
          Relay automatically appends the original client IP to the{' '}
          <code className="docs-inline">x-forwarded-for</code> header and explicitly sets the{' '}
          <code className="docs-inline">x-relay-client-ip</code> header. You can use these headers
          to identify the real origin of the request.
        </p>

        <ul
          className="docs-ul"
          style={{
            paddingLeft: '20px',
            marginBottom: '14px',
            fontSize: '15px',
            color: 'var(--text)',
            lineHeight: '1.65',
          }}
        >
          <li style={{ marginBottom: '6px' }}>
            <strong>x-forwarded-for:</strong> Standard header showing the originating IP address.
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>x-relay-client-ip:</strong> Relay-specific header for reliable IP
            identification.
          </li>
        </ul>

        <h2 className="docs-h2" id="enforce-relay">
          Enforcing Relay Traffic
        </h2>
        <p className="docs-p">
          To prevent malicious actors from bypassing Relay and hitting your backend directly, you
          should write a middleware that rejects any requests that do not originate from Relay. You
          can do this by validating the presence of Relay-specific headers or by whitelisting
          Relay's IP addresses.
        </p>

        <CodeCard tabs={middlewareCode} />
      </main>

      <aside className="docs-side"></aside>

      <DocsToc
        links={[
          { label: 'Trusting Proxies', href: '#trust-proxy' },
          { label: 'Handling Client IPs', href: '#client-ips' },
          { label: 'Enforcing Relay Traffic', href: '#enforce-relay' },
        ]}
      />
    </>
  );
}
