export default function ChangelogPage() {
  return (
    <main className="docs-main">
      <div className="docs-breadcrumb">Updates</div>
      <h1 className="docs-h1">Changelog</h1>

      <p className="docs-lede">
        New features, fixes, and improvements to the Relay platform and API.
      </p>

      <h2
        className="docs-h2"
        style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginTop: '40px' }}
      >
        <span
          className="docs-p muted mono"
          style={{ fontSize: '13px', fontWeight: 400, marginRight: '16px' }}
        >
          2026-09-11
        </span>
        Advanced Rate Limiting
      </h2>
      <ul
        style={{
          paddingLeft: '20px',
          marginBottom: '14px',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: '1.6',
        }}
      >
        <li style={{ marginBottom: '6px' }}>
          Added support for IP-based and header-based rate limiting rules.
        </li>
        <li style={{ marginBottom: '6px' }}>
          New <code className="docs-inline">/v1/policies</code> API endpoint to programmatically
          manage rate limit rules.
        </li>
        <li style={{ marginBottom: '6px' }}>
          Fixed an issue where the dashboard would show healthy APIs as degraded under certain edge
          cases.
        </li>
      </ul>

      <h2
        className="docs-h2"
        style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginTop: '40px' }}
      >
        <span
          className="docs-p muted mono"
          style={{ fontSize: '13px', fontWeight: 400, marginRight: '16px' }}
        >
          2026-08-24
        </span>
        Webhook Signatures & Retries
      </h2>
      <ul
        style={{
          paddingLeft: '20px',
          marginBottom: '14px',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: '1.6',
        }}
      >
        <li style={{ marginBottom: '6px' }}>
          All outbound webhooks now include a <code className="docs-inline">Relay-Signature</code>{' '}
          header using HMAC SHA-256.
        </li>
        <li style={{ marginBottom: '6px' }}>
          Failed webhooks now automatically retry with exponential backoff up to 5 times over 3
          hours.
        </li>
      </ul>

      <h2
        className="docs-h2"
        style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginTop: '40px' }}
      >
        <span
          className="docs-p muted mono"
          style={{ fontSize: '13px', fontWeight: 400, marginRight: '16px' }}
        >
          2026-08-01
        </span>
        Initial Public Beta
      </h2>
      <ul
        style={{
          paddingLeft: '20px',
          marginBottom: '14px',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: '1.6',
        }}
      >
        <li style={{ marginBottom: '6px' }}>Launched the Relay Gateway and Dashboard.</li>
        <li style={{ marginBottom: '6px' }}>
          Support for dynamic routing, basic API key authentication, and traffic observability.
        </li>
      </ul>
    </main>
  );
}
