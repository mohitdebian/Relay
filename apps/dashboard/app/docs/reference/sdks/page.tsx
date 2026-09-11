export default function SDKsPage() {
  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Reference</div>
        <div className="docs-h1">SDKs & libraries</div>

        <div className="docs-lede">
          Connect to Relay using your preferred language or framework.
        </div>

        <h2 className="docs-h2" id="official-sdks">
          Official SDKs
        </h2>
        <p className="docs-p">
          We are currently focusing on stabilizing the core Relay Gateway and Management API. As a result, <b>there are currently no official Relay SDKs available</b> for languages like Node.js, Python, or Go.
        </p>

        <h2 className="docs-h2" id="using-rest">
          Using the REST API
        </h2>
        <p className="docs-p">
          Relay is built API-first. Everything you can do in the dashboard can be done via our REST API. Until official SDKs are released, you can interact with Relay using standard HTTP clients built into your language or framework of choice.
        </p>
        <p className="docs-p">
          See the code snippets on the right side of any API endpoint page (like <a href="/docs/api-keys/create" className="docs-link">Create API key</a>) for examples using <code className="docs-inline">fetch</code> in JavaScript and <code className="docs-inline">requests</code> in Python.
        </p>

      </main>

      <aside className="docs-side">
        {/* Prose-only page without right rail */}
      </aside>
    </>
  );
}
