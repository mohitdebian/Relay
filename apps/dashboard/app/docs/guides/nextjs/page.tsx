import CodeCard from '../../_components/CodeCard';
import { DocsToc } from '../../_components/DocsToc';

export default function NextjsGuidePage() {
  const codeTabs = [
    {
      label: 'app/api/webhook/route.ts',
      code: (
        <>
          <span className="docs-tok-comment">{'// Next.js App Router Webhook Handler'}</span>
          {'\n'}
          import {'{'} NextResponse {'}'} from <span className="docs-tok-str">'next/server'</span>;{'\n'}
          import crypto from <span className="docs-tok-str">'crypto'</span>;{'\n'}
          {'\n'}
          export async function POST(req: Request) {'{\n'}
          {'  '}const payload = await req.text();{'\n'}
          {'  '}const signature = req.headers.get(<span className="docs-tok-str">'x-relay-signature'</span>);{'\n'}
          {'\n'}
          {'  '}if (!signature) {'{\n'}
          {'    '}return NextResponse.json({'{\n'}
          {'      '}error: <span className="docs-tok-str">'Missing signature'</span>{'\n'}
          {'    }'}, {'{'} status: <span className="docs-tok-str">401</span> {'}'});{'\n'}
          {'  }'}
          {'\n'}
          {'  '}const secret = process.env.RELAY_WEBHOOK_SECRET;{'\n'}
          {'  '}const isVerified = crypto.verify({'\n'}
          {'    '}null,{'\n'}
          {'    '}Buffer.from(payload),{'\n'}
          {'    '}secret,{'\n'}
          {'    '}Buffer.from(signature, <span className="docs-tok-str">'base64'</span>){'\n'}
          {'  '});{'\n'}
          {'\n'}
          {'  '}if (!isVerified) {'{\n'}
          {'    '}return NextResponse.json({'{\n'}
          {'      '}error: <span className="docs-tok-str">'Invalid signature'</span>{'\n'}
          {'    }'}, {'{'} status: <span className="docs-tok-str">401</span> {'}'});{'\n'}
          {'  }'}
          {'\n'}
          {'  '}<span className="docs-tok-comment">{'// Process your verified webhook here'}</span>{'\n'}
          {'  '}return NextResponse.json({'{\n'}
          {'    '}success: <span className="docs-tok-key">true</span>{'\n'}
          {'  }'});{'\n'}
          {'}'}
        </>
      )
    }
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Guides</div>
        <h1 className="docs-h1">Next.js Webhooks</h1>

        <p className="docs-lede">
          Protect your Next.js API routes with Relay and verify webhooks.
        </p>

        <h2 className="docs-h2" id="verifying-webhooks">
          Verifying Webhooks
        </h2>
        <p className="docs-p">
          When Relay forwards a request to your API, it includes an <code className="docs-inline">x-relay-signature</code> header. 
          You can verify this signature in your Next.js App Router <code className="docs-inline">Route Handlers</code> (e.g., <code className="docs-inline">app/api/webhook/route.ts</code>) using Node.js's built-in <code className="docs-inline">crypto.verify</code> method.
        </p>
        
        <p className="docs-p">
          Below is a complete example of a Next.js App Router webhook endpoint that securely validates inbound requests from Relay.
        </p>

        <ul className="docs-ul">
          <li>
            A Next.js project using the <strong>App Router</strong>.
          </li>
          <li>
            Your <strong>Relay Webhook Secret</strong> stored in <code className="docs-inline">process.env.RELAY_WEBHOOK_SECRET</code>.
          </li>
        </ul>
      </main>

      <aside className="docs-side">
        <CodeCard tabs={codeTabs} />
      </aside>

      <DocsToc
        links={[
          { label: 'Verifying Webhooks', href: '#verifying-webhooks' },
        ]}
      />
    </>
  );
}
