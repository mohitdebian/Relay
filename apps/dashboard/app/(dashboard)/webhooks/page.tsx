import Typewriter from '@/app/components/Typewriter';
import { getWebhooksAction } from '@/app/actions/webhooks';
import { AddWebhookButton } from '@/app/components/modals/AddWebhookModal';
const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');

export default async function WebhooksPage() {
  const data = await getWebhooksAction().catch((e) => {
    if (isRedirectError(e)) throw e;
    return { webhooks: [] };
  });
  const webhooks = data?.webhooks || [];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="WEBHOOKS" />
          </div>
          <div className="page-sub">{webhooks?.length || 0} configured endpoints</div>
        </div>
        <AddWebhookButton />
      </div>
      <div className="panel">
        {!webhooks || webhooks.length === 0 ? (
          <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
            No webhooks configured.<span className="cursor-blink"></span>
          </div>
        ) : (
          webhooks.map((w: any) => (
            <div key={w.id} className="row" style={{ gridTemplateColumns: '1.6fr 1fr .8fr .8fr' }}>
              <span className="mono c-strong">{w.url}</span>
              <span>
                {w.events?.map((event: string, j: number) => (
                  <span key={j} className="badge" style={{ marginRight: '4px' }}>
                    {event}
                  </span>
                ))}
              </span>
              <span className="c-secondary">
                last{' '}
                {w.last_triggered_at ? new Date(w.last_triggered_at).toLocaleDateString() : 'never'}
              </span>
              <span className={`status ${w.status || 'active'} c-right`}>
                <span className={`dot ${w.status === 'active' ? 'green' : 'red'}`} />
                {w.status === 'active' ? 'Active' : 'Failing'}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
