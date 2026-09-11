import { DocsToc } from '../../_components/DocsToc';
import CodeCard from '../../_components/CodeCard';

export default function FastApiGuidePage() {
  const tabsApp = [
    {
      label: 'main.py',
      code: (
        <>
          <span className="docs-tok-keyword">from</span> fastapi <span className="docs-tok-keyword">import</span> FastAPI, Request, HTTPException{'\n'}
          <span className="docs-tok-keyword">from</span> pydantic <span className="docs-tok-keyword">import</span> BaseModel{'\n\n'}
          app = FastAPI(){'\n\n'}
          <span className="docs-tok-keyword">class</span> <span className="docs-tok-type">WebhookResponse</span>(BaseModel):{'\n'}
          {'    '}status: <span className="docs-tok-type">str</span>{'\n'}
          {'    '}message: <span className="docs-tok-type">str</span>{'\n\n'}
          <span className="docs-tok-keyword">class</span> <span className="docs-tok-type">WebhookPayload</span>(BaseModel):{'\n'}
          {'    '}event: <span className="docs-tok-type">str</span>{'\n'}
          {'    '}data: <span className="docs-tok-type">dict</span>{'\n\n'}
          <span className="docs-tok-meta">@app.post</span>(<span className="docs-tok-str">"/webhook"</span>, response_model=WebhookResponse){'\n'}
          <span className="docs-tok-keyword">async def</span> <span className="docs-tok-fn">handle_webhook</span>(payload: WebhookPayload, request: Request):{'\n'}
          {'    '}<span className="docs-tok-comment"># Verify the request came through Relay</span>{'\n'}
          {'    '}signature = request.headers.get(<span className="docs-tok-str">"x-relay-signature"</span>){'\n'}
          {'    '}<span className="docs-tok-keyword">if not</span> signature:{'\n'}
          {'        '}<span className="docs-tok-keyword">raise</span> HTTPException(status_code=<span className="docs-tok-number">401</span>, detail=<span className="docs-tok-str">"Missing Relay signature"</span>){'\n\n'}
          {'    '}<span className="docs-tok-comment"># Process the payload securely</span>{'\n'}
          {'    '}return WebhookResponse(status=<span className="docs-tok-str">"success"</span>, message=<span className="docs-tok-str">"Webhook received"</span>)
        </>
      ),
    },
  ];

  const tabsUvicorn = [
    {
      label: 'Terminal',
      code: (
        <>
          uvicorn main:app --proxy-headers --forwarded-allow-ips=<span className="docs-tok-str">"*"</span>
        </>
      ),
    },
  ];

  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Guides</div>
        <h1 className="docs-h1">FastAPI Webhooks</h1>

        <p className="docs-lede">
          Proxy traffic to FastAPI and consume JSON webhooks securely behind your Relay gateway.
        </p>

        <h2 className="docs-h2" id="overview">
          Overview
        </h2>
        <p className="docs-p">
          FastAPI is a high-performance Python framework perfect for building JSON APIs and handling webhooks. By placing Relay in front of your FastAPI service, Relay manages authentication, rate limiting, and observability. This allows your Python code to focus purely on business logic using standard Pydantic models.
        </p>

        <h2 className="docs-h2" id="building-the-api">
          Building the API
        </h2>
        <p className="docs-p">
          In a standard <code className="docs-inline">FastAPI()</code> app, you can seamlessly validate incoming JSON payloads by defining Pydantic models. To ensure that incoming traffic is securely routed through your gateway (and not spoofed directly to your server), you can read the <code className="docs-inline">Request.headers</code> for Relay-specific signatures, such as <code className="docs-inline">x-relay-signature</code>.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <CodeCard tabs={tabsApp} />
        </div>

        <h2 className="docs-h2" id="running-with-uvicorn">
          Running with Uvicorn
        </h2>
        <p className="docs-p">
          Because Relay proxies requests to your backend, your FastAPI application runs behind a reverse proxy. To ensure FastAPI receives the correct client IP addresses and forwarded headers, you must configure Uvicorn to trust these forwarded IPs.
        </p>
        <p className="docs-p">
          Use the <code className="docs-inline">--proxy-headers</code> and <code className="docs-inline">--forwarded-allow-ips</code> flags when starting your uvicorn server:
        </p>

        <div style={{ marginBottom: '24px' }}>
          <CodeCard tabs={tabsUvicorn} />
        </div>

        <p className="docs-p">
          For production deployments, we highly recommend restricting <code className="docs-inline">forwarded_allow_ips</code> to Relay's specific egress IP addresses rather than allowing all IPs (<code className="docs-inline">*</code>).
        </p>
      </main>

      <aside className="docs-side"></aside>

      <DocsToc
        links={[
          { label: 'Overview', href: '#overview' },
          { label: 'Building the API', href: '#building-the-api' },
          { label: 'Running with Uvicorn', href: '#running-with-uvicorn' },
        ]}
      />
    </>
  );
}
