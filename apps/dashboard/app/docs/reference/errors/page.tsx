import CodeCard from '../../../_components/CodeCard';

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

        <ul className="docs-ul">
          <li><code className="docs-inline">400 Bad Request</code> - The request was unacceptable, often due to missing a required parameter. Validation failures will include an <code className="docs-inline">issues</code> array detailing the exact fields.</li>
          <li><code className="docs-inline">401 Unauthorized</code> - No valid API key provided, or invalid session token.</li>
          <li><code className="docs-inline">403 Forbidden</code> - The API key doesn't have permissions to perform the request (e.g. requires <code className="docs-inline">admin</code> or <code className="docs-inline">owner</code> role).</li>
          <li><code className="docs-inline">404 Not Found</code> - The requested resource doesn't exist, or you lack permissions to view it.</li>
          <li><code className="docs-inline">409 Conflict</code> - The request conflicts with another resource (e.g. an API with this slug already exists in the workspace).</li>
          <li><code className="docs-inline">429 Too Many Requests</code> - Too many requests hit the API too quickly.</li>
          <li><code className="docs-inline">500, 502, 503, 504 Server Errors</code> - Something went wrong on Relay's end.</li>
        </ul>

      </main>

      <aside className="docs-side">
        <div className="docs-response-label">Example 400 Validation Error</div>
        <CodeCard tabs={exampleTabs} />
      </aside>
    </>
  );
}
