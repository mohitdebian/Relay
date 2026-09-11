import CodeCard from '../../_components/CodeCard';

export default function WebhooksOverviewPage() {
  const payloadTabs = [
    {
      label: 'JSON',
      code: (
        <>
          {'{'}
          {'\n'}
          {'  '}
          <span className="docs-tok-key">"event"</span>:{' '}
          <span className="docs-tok-str">"API_CREATED"</span>,{'\n'}
          {'  '}
          <span className="docs-tok-key">"payload"</span>: {'{'}
          {'\n'}
          {'    '}
          <span className="docs-tok-key">"actorId"</span>:{' '}
          <span className="docs-tok-str">1</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"resourceType"</span>:{' '}
          <span className="docs-tok-str">"api"</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"resourceId"</span>:{' '}
          <span className="docs-tok-str">123</span>,{'\n'}
          {'    '}
          <span className="docs-tok-key">"metadata"</span>: {'{'}
          {'\n'}
          {'      '}
          <span className="docs-tok-key">"name"</span>:{' '}
          <span className="docs-tok-str">"Production API"</span>
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
        <div className="docs-h1">Overview</div>

        <div className="docs-lede">
          Listen for events occurring in your workspace in real-time.
        </div>

        <h2 className="docs-h2" id="how-they-work">
          How They Work
        </h2>
        <p className="docs-p">
          Webhooks allow you to build or set up integrations that subscribe to certain events in Relay. When one of those events is triggered, we'll send a HTTP POST payload to the webhook's configured URL. 
        </p>

        <h2 className="docs-h2" id="payload-structure">
          Payload Structure
        </h2>
        <p className="docs-p">
          Every webhook delivery includes a standard envelope. The <code className="docs-inline">event</code> field indicates what happened, and the <code className="docs-inline">payload</code> contains the specifics of the resource that was affected.
        </p>

        <h2 className="docs-h2" id="retries">
          Retry Logic
        </h2>
        <p className="docs-p">
          If your server returns a non-200 HTTP status code, Relay will automatically retry the delivery up to 5 times. 
          We use an exponential backoff strategy starting at a 2000ms delay.
        </p>
      </main>

      <aside className="docs-side">
        <div className="docs-response-label">Example webhook payload</div>
        <CodeCard tabs={payloadTabs} />
      </aside>
    </>
  );
}
