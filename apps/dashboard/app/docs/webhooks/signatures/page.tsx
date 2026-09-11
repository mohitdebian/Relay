import { Callout } from '../../_components/Callout';
import CodeCard from '../../_components/CodeCard';

export default function WebhooksSignaturesPage() {
  const codeTabs = [
    {
      label: 'Node.js',
      code: (
        <>
          <span className="docs-tok-key">const</span> crypto = <span className="docs-tok-str">require</span>(<span className="docs-tok-str">'crypto'</span>);{'\n\n'}
          <span className="docs-tok-key">function</span> <span className="docs-tok-str">isValid</span>(rawBody, signature, secret) {'{\n'}
          {'  '}<span className="docs-tok-key">const</span> expected = crypto{'\n'}
          {'    '}.<span className="docs-tok-str">createHmac</span>(<span className="docs-tok-str">'sha256'</span>, secret){'\n'}
          {'    '}.<span className="docs-tok-str">update</span>(rawBody){'\n'}
          {'    '}.<span className="docs-tok-str">digest</span>(<span className="docs-tok-str">'hex'</span>);{'\n'}
          {'  '}<span className="docs-tok-key">return</span> crypto.<span className="docs-tok-str">timingSafeEqual</span>({'\n'}
          {'    '}Buffer.<span className="docs-tok-str">from</span>(expected),{'\n'}
          {'    '}Buffer.<span className="docs-tok-str">from</span>(signature){'\n'}
          {'  });\n'}
          {'}'}
        </>
      ),
    },
    {
      label: 'Python',
      code: (
        <>
          <span className="docs-tok-key">import</span> hmac{'\n'}
          <span className="docs-tok-key">import</span> hashlib{'\n\n'}
          <span className="docs-tok-key">def</span> <span className="docs-tok-str">is_valid</span>(raw_body: <span className="docs-tok-key">bytes</span>, signature: <span className="docs-tok-key">str</span>, secret: <span className="docs-tok-key">str</span>) -&gt; <span className="docs-tok-key">bool</span>:{'\n'}
          {'    '}expected = hmac.new({'\n'}
          {'        '}secret.encode(<span className="docs-tok-str">'utf-8'</span>),{'\n'}
          {'        '}raw_body,{'\n'}
          {'        '}hashlib.sha256{'\n'}
          {'    '}).hexdigest(){'\n'}
          {'    '}<span className="docs-tok-key">return</span> hmac.compare_digest(expected, signature)
        </>
      ),
    }
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Webhooks</div>
        <div className="docs-h1">Verifying signatures</div>
        
        <div className="docs-lede">
          Always verify a webhook's signature before trusting its payload — anyone can send a POST to your endpoint URL.
        </div>

        <h2 className="docs-h2" id="how-it-works">
          How it works
        </h2>
        <p className="docs-p">
          Every delivery includes a <code className="docs-inline">Relay-Signature</code> header: an HMAC-SHA256 hash of the raw request body, signed with your webhook's signing secret (shown once when the webhook is created).
        </p>

        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <div className="docs-response-label">Verification example</div>
          <CodeCard tabs={codeTabs} />
        </div>
        
        <Callout variant="warn">
          <b>Important —</b> compute the HMAC over the <b>raw request body</b>, before JSON parsing. Re-serializing the parsed object will produce a different signature and always fail verification.
        </Callout>

      </main>

      <aside className="docs-side">
        {/* Prose-only page without right rail */}
      </aside>
    </>
  );
}
