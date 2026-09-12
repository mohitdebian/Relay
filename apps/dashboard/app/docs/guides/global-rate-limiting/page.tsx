import { DocsToc } from '../../_components/DocsToc';
import CodeCard from '../../_components/CodeCard';

export default function GlobalRateLimitingPage() {
  const tabs = [
    {
      label: 'HTTP Headers',
      code: (
        <>
          HTTP/1.1 <span className="docs-tok-str">200 OK</span>
          {'\n'}
          x-relay-limit-limit: <span className="docs-tok-str">1000</span>
          {'\n'}
          x-relay-limit-remaining: <span className="docs-tok-str">999</span>
          {'\n'}
          x-relay-limit-reset: <span className="docs-tok-str">1694481000</span>
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Guides</div>
        <h1 className="docs-h1">Global Rate Limiting</h1>

        <p className="docs-lede">
          How to design rate limits for multi-tenant SaaS applications and protect your upstream
          services globally across all Relay Edge POPs.
        </p>

        <h2 className="docs-h2" id="tiered-limits">
          Tiered Limits (Free vs Pro)
        </h2>
        <p className="docs-p">
          When building a multi-tenant SaaS, you often need different rate limits depending on the
          customer's subscription tier. For example, Free users might be limited to 100 requests per
          minute, while Pro users can make up to 1,000 requests per minute.
        </p>
        <p className="docs-p">
          Relay allows you to define multiple rate limit profiles (e.g., Free, Pro, Enterprise) and
          dynamically apply them based on the API Key being used.
        </p>

        <h2 className="docs-h2" id="mapping-keys">
          Mapping API Keys to Profiles
        </h2>
        <p className="docs-p">
          Instead of hardcoding limits into your backend application, you can map each API Key to a
          specific rate limit profile in Relay. When a client makes a request, Relay inspects the
          token, identifies the associated profile, and enforces the corresponding limit before
          traffic ever reaches your backend.
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
            <strong>Free tier:</strong> 100 req / minute
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Pro tier:</strong> 1,000 req / minute
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Enterprise tier:</strong> 10,000 req / minute
          </li>
        </ul>

        <h2 className="docs-h2" id="edge-enforcement">
          Global Edge Enforcement
        </h2>
        <p className="docs-p">
          Relay operates a globally distributed edge network. When you configure a rate limit, it
          applies globally across all Relay Edge POPs (Points of Presence). This means if a user
          makes 50 requests in Tokyo and 50 requests in New York, they will hit a 100-request global
          limit instantly, ensuring your upstream services are protected from distributed abuse.
        </p>

        <h2 className="docs-h2" id="rate-limit-headers">
          Rate Limit Headers
        </h2>
        <p className="docs-p">
          To help developers understand their current usage, Relay automatically injects standard
          rate limit headers into every HTTP response returned to the client:
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
            <code className="docs-inline">x-relay-limit-limit</code>: The maximum number of requests
            permitted in the current time window.
          </li>
          <li style={{ marginBottom: '6px' }}>
            <code className="docs-inline">x-relay-limit-remaining</code>: The number of requests
            remaining in the current window.
          </li>
          <li style={{ marginBottom: '6px' }}>
            <code className="docs-inline">x-relay-limit-reset</code>: The Unix timestamp when the
            current window expires and limits are reset.
          </li>
        </ul>
      </main>

      <aside className="docs-side">
        <div className="docs-response-label" style={{ marginTop: '32px' }}>
          Response Headers Example
        </div>
        <CodeCard tabs={tabs} />
      </aside>

      <DocsToc
        links={[
          { label: 'Tiered Limits (Free vs Pro)', href: '#tiered-limits' },
          { label: 'Mapping API Keys to Profiles', href: '#mapping-keys' },
          { label: 'Global Edge Enforcement', href: '#edge-enforcement' },
          { label: 'Rate Limit Headers', href: '#rate-limit-headers' },
        ]}
      />
    </>
  );
}
