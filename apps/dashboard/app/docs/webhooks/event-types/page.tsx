import CodeCard from '../../../_components/CodeCard';

export default function WebhooksEventTypesPage() {
  const exampleTabs = [
    {
      label: 'JSON',
      code: (
        <>
          {'{'}
          {'\n'}
          {'  '}
          <span className="docs-tok-key">"event"</span>:{' '}
          <span className="docs-tok-str">"API_KEY_REVOKED"</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"payload"</span>: {'{'}
          {'\n'}
          {'    '}
          <span className="docs-tok-key">"actorId"</span>:{' '}
          <span className="docs-tok-str">42</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"resourceType"</span>:{' '}
          <span className="docs-tok-str">"api_key"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"resourceId"</span>:{' '}
          <span className="docs-tok-str">8</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"metadata"</span>: {'{'}
          {'\n'}
          {'      '}
          <span className="docs-tok-key">"api_id"</span>:{' '}
          <span className="docs-tok-str">1</span>
          {'\n'}
          {'    }'}
          {'\n'}
          {'  },'}
          {'\n'}
          {'  '}
          <span className="docs-tok-key">"timestamp"</span>:{' '}
          <span className="docs-tok-str">"2026-09-11T12:00:00.000Z"</span>
          {'\n'}
          {'}'}
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Webhooks</div>
        <div className="docs-h1">Event types</div>

        <div className="docs-lede">
          The full list of events currently emitted by Relay webhooks.
        </div>

        <h2 className="docs-h2" id="available-events">
          Available Events
        </h2>
        <p className="docs-p">
          The following events are emitted as audit actions occur within your workspace.
        </p>

        <ul className="docs-ul">
          <li><code className="docs-inline">API_CREATED</code> - A new API proxy target was created.</li>
          <li><code className="docs-inline">API_UPDATED</code> - An existing API's configuration was modified.</li>
          <li><code className="docs-inline">API_DELETED</code> - An API target was removed.</li>
          <li><code className="docs-inline">API_KEY_CREATED</code> - A new API key was generated.</li>
          <li><code className="docs-inline">API_KEY_REVOKED</code> - An API key was revoked (soft-deleted).</li>
        </ul>

      </main>

      <aside className="docs-side">
        <div className="docs-response-label">Example API_KEY_REVOKED event</div>
        <CodeCard tabs={exampleTabs} />
      </aside>
    </>
  );
}
