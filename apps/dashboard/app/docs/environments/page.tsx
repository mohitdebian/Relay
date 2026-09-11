export default function EnvironmentsPage() {
  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Getting Started</div>
        <div className="docs-h1">Environments</div>

        <div className="docs-lede">
          Organize your API targets and API keys using environment labels.
        </div>

        <h2 className="docs-h2" id="overview">
          Overview
        </h2>
        <p className="docs-p">
          Relay supports three environment types: <code className="docs-inline">development</code>, <code className="docs-inline">staging</code>, and <code className="docs-inline">production</code>. 
          When you create an API target or an API key, you must assign it to one of these environments.
        </p>
        <p className="docs-p">
          Currently, environments act primarily as metadata labels to help you organize your resources. You can filter resources by environment in the dashboard to clearly distinguish your production keys from your development keys.
        </p>

        <h2 className="docs-h2" id="api-keys-environments">
          API Keys and Environments
        </h2>
        <p className="docs-p">
          The <code className="docs-inline">environment</code> field is required when generating a new API key. 
          The prefix of the raw key generated reflects the environment to help you quickly identify it in your source code:
        </p>

        <ul className="docs-ul">
          <li><code className="docs-inline">production</code> generates keys starting with <code className="docs-inline">relay_live_</code></li>
          <li><code className="docs-inline">staging</code> generates keys starting with <code className="docs-inline">relay_test_</code></li>
          <li><code className="docs-inline">development</code> generates keys starting with <code className="docs-inline">relay_dev_</code></li>
        </ul>

        <h2 className="docs-h2" id="routing-enforcement">
          Routing and Enforcement
        </h2>
        <p className="docs-p">
          While environments help you organize keys, the Relay Gateway does not currently enforce strict routing isolations between environments out-of-the-box (e.g. automatically blocking a <code className="docs-inline">relay_test_</code> key from hitting a <code className="docs-inline">production</code> API target). 
          However, you can use these labels to manage separate API targets (e.g. <code className="docs-inline">my-api-prod</code> vs <code className="docs-inline">my-api-dev</code>) and issue the appropriately labeled keys for each.
        </p>

      </main>
      <aside className="docs-side">
        {/* Prose-only page without right rail */}
      </aside>
    </>
  );
}
