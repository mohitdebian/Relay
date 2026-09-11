import CodeCard from '../../_components/CodeCard';

export default function RateLimitsPage() {
  const exampleTabs = [
    {
      label: 'HTTP',
      code: (
        <>
          <span className="docs-tok-comment"># HTTP Response Headers</span>{'\n'}
          <span className="docs-tok-key">HTTP/1.1</span> 429 Too Many Requests{'\n'}
          <span className="docs-tok-key">X-RateLimit-Limit</span>: 100{'\n'}
          <span className="docs-tok-key">X-RateLimit-Remaining</span>: 0{'\n'}
          <span className="docs-tok-key">X-RateLimit-Reset</span>: 1709930400{'\n'}
          <span className="docs-tok-key">Retry-After</span>: 34{'\n\n'}
          <span className="docs-tok-comment"># JSON Response Body</span>{'\n'}
          {'{'}
          {'\n'}
          {'  '}
          <span className="docs-tok-key">"error"</span>:{' '}
          <span className="docs-tok-str">"Too many requests. Please try again later."</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"retryAfter"</span>:{' '}
          <span className="docs-tok-str">34</span>
          {'\n'}
          {'}'}
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Reference</div>
        <div className="docs-h1">Rate limits</div>

        <div className="docs-lede">
          Understand how Relay protects your APIs and its own management endpoints.
        </div>

        <h2 className="docs-h2" id="management-limits">
          Management API Limits
        </h2>
        <p className="docs-p">
          To ensure stability, the Relay Management API enforces the following rate limits across all workspaces based on IP address and authentication token:
        </p>

        <ul className="docs-ul">
          <li><b>Authentication endpoints:</b> 20 requests per 15 minutes.</li>
          <li><b>Standard endpoints (e.g. creating/listing APIs):</b> 100 requests per 1 minute.</li>
          <li><b>Sensitive endpoints (e.g. revoking API keys):</b> 10 requests per 1 minute.</li>
        </ul>

        <h2 className="docs-h2" id="gateway-limits">
          Gateway Limits
        </h2>
        <p className="docs-p">
          For your actual API targets, rate limiting is <b>opt-in</b>. When you create an API via the <a href="/docs/apis/create" className="docs-link">Create API Route</a>, you can specify <code className="docs-inline">rate_limit_enabled: true</code>, along with a <code className="docs-inline">rate_limit_max</code> and <code className="docs-inline">rate_limit_window</code>. These limits are evaluated per unique API Key making requests through the gateway.
        </p>

        <h2 className="docs-h2" id="handling-limits">
          Handling Rate Limits
        </h2>
        <p className="docs-p">
          When a rate limit is exceeded, Relay returns an HTTP <code className="docs-inline">429 Too Many Requests</code> response. 
          The response includes standard rate limit headers to help you gracefully back off:
        </p>
        <ul className="docs-ul">
          <li><code className="docs-inline">X-RateLimit-Limit</code>: The maximum number of requests allowed in the current window.</li>
          <li><code className="docs-inline">X-RateLimit-Remaining</code>: The number of requests remaining in the current window.</li>
          <li><code className="docs-inline">X-RateLimit-Reset</code>: The Unix timestamp when the current window expires and limits are reset.</li>
        </ul>

      </main>

      <aside className="docs-side">
        <div className="docs-response-label">Example 429 response</div>
        <CodeCard tabs={exampleTabs} />
      </aside>
    </>
  );
}
