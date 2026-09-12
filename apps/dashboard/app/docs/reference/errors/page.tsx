import CodeCard from '../../_components/CodeCard';

export default function ErrorsPage() {
  const exampleTabs = [
    {
      label: 'JSON',
      code: (
        <>
          {'{'}
          {'\n'}
          {'  '}
          <span className="docs-tok-key">"error"</span>:{' '}
          <span className="docs-tok-str">"Validation failed"</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"issues"</span>: [{'\n'}
          {'    {'}
          {'\n'}
          {'      '}
          <span className="docs-tok-key">"path"</span>:{' '}
          <span className="docs-tok-str">"name"</span>,{'\n'}
          {'      '}
          <span className="docs-tok-key">"message"</span>:{' '}
          <span className="docs-tok-str">"String must contain at least 1 character(s)"</span>
          {'\n'}
          {'    }'}
          {'\n'}
          {'  ]'}
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
        <div className="docs-h1">Errors</div>

        <div className="docs-lede">
          Relay uses conventional HTTP response codes to indicate the success or failure of an API request.
        </div>

        <h2 className="docs-h2" id="http-status-codes">
          HTTP Status Codes
        </h2>
        <p className="docs-p">
          In general, codes in the <code className="docs-inline">2xx</code> range indicate success. Codes in the <code className="docs-inline">4xx</code> range indicate an error that failed given the information provided (e.g., a required parameter was omitted). Codes in the <code className="docs-inline">5xx</code> range indicate an error with Relay's servers.
        </p>

        <div style={{ marginTop: '24px', marginBottom: '32px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-secondary)', width: '30%' }}>Status Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dot" style={{ background: 'var(--red)' }}></span>
                    <span className="mono c-strong" style={{ fontSize: '13px' }}>400 Bad Request</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text)', lineHeight: '1.5' }}>
                  The request was unacceptable, often due to missing a required parameter. Validation failures will include an <code className="docs-inline">issues</code> array detailing the exact fields.
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dot" style={{ background: 'var(--red)' }}></span>
                    <span className="mono c-strong" style={{ fontSize: '13px' }}>401 Unauthorized</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text)', lineHeight: '1.5' }}>
                  No valid API key provided, or invalid session token.
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dot" style={{ background: 'var(--red)' }}></span>
                    <span className="mono c-strong" style={{ fontSize: '13px' }}>403 Forbidden</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text)', lineHeight: '1.5' }}>
                  The API key doesn't have permissions to perform the request (e.g. requires <code className="docs-inline">admin</code> or <code className="docs-inline">owner</code> role).
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dot" style={{ background: 'var(--red)' }}></span>
                    <span className="mono c-strong" style={{ fontSize: '13px' }}>404 Not Found</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text)', lineHeight: '1.5' }}>
                  The requested resource doesn't exist, or you lack permissions to view it.
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dot" style={{ background: 'var(--yellow)' }}></span>
                    <span className="mono c-strong" style={{ fontSize: '13px' }}>409 Conflict</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text)', lineHeight: '1.5' }}>
                  The request conflicts with another resource (e.g. API with this slug already exists in the workspace).
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dot" style={{ background: 'var(--yellow)' }}></span>
                    <span className="mono c-strong" style={{ fontSize: '13px' }}>429 Too Many Requests</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text)', lineHeight: '1.5' }}>
                  Too many requests hit the API too quickly.
                </td>
              </tr>
              <tr>
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dot" style={{ background: 'var(--red)' }}></span>
                    <span className="mono c-strong" style={{ fontSize: '13px' }}>500, 502, 503, 504</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text)', lineHeight: '1.5' }}>
                  Server Errors — Something went wrong on Relay's end.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>

      <aside className="docs-side">
        <div className="docs-response-label">Example 400 Validation Error</div>
        <CodeCard tabs={exampleTabs} />
      </aside>
    </>
  );
}
