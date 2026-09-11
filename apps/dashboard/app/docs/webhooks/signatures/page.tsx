import { Callout } from '../../../_components/Callout';

export default function WebhooksSignaturesPage() {
  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Webhooks</div>
        <div className="docs-h1">Verifying signatures</div>

        <div className="docs-lede">
          Ensure that incoming webhooks are actually coming from Relay.
        </div>

        <Callout variant="warn">
          <b>Important Security Notice —</b> Webhook payload signatures are <b>not yet implemented</b> in the current release of Relay. 
          While earlier changelogs mentioned a <code className="docs-inline">Relay-Signature</code> header, this feature has been delayed.
        </Callout>

        <h2 className="docs-h2" id="current-state">
          Current State
        </h2>
        <p className="docs-p">
          Currently, webhooks are delivered without cryptographic signatures. To secure your webhook receivers in the meantime, we strongly recommend keeping your endpoint URL a secret and relying on obscurity (e.g. using a high-entropy path like <code className="docs-inline">/webhooks/relay_a9f8b...</code>).
        </p>

        <h2 className="docs-h2" id="future-implementation">
          Future Implementation (v3.0)
        </h2>
        <p className="docs-p">
          In a future update, Relay will sign webhook events using a symmetric secret key. We will include a <code className="docs-inline">Relay-Signature</code> HTTP header with an HMAC SHA-256 signature, allowing your server to verify the authenticity of the payload before processing it.
        </p>

      </main>

      <aside className="docs-side">
        {/* Prose-only page without right rail */}
      </aside>
    </>
  );
}
