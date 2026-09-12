import { DocsToc } from '../_components/DocsToc';
import { DocsCard } from '../_components/DocsCard';

export default function IntroductionPage() {
  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Getting Started</div>
        <h1 className="docs-h1">Introduction</h1>

        <p className="docs-lede">
          Relay is a developer-first API gateway and management platform. It sits between your clients
          and your backend services, providing instant routing, rate limiting, authentication, and
          observability without any complex configuration.
        </p>

        <h2 className="docs-h2" id="why-relay">
          Why Relay?
        </h2>
        <p className="docs-p">
          Building APIs is easy, but managing them in production is hard. Relay handles the
          operational heavy lifting so you can focus on building features. By routing your traffic
          through Relay, you instantly gain:
        </p>
        <ul
          style={{
            paddingLeft: '20px',
            marginBottom: '14px',
            fontSize: '15px',
            color: 'var(--text)',
            lineHeight: '1.65',
          }}
        >
          <li style={{ marginBottom: '6px' }}>
            <strong>Automatic observability:</strong> Every request is logged, timed, and analyzed.
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Zero-config rate limiting:</strong> Protect your upstream services from abuse
            instantly.
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>API key management:</strong> Issue and revoke keys without writing any auth code.
          </li>
        </ul>

        <h2 className="docs-h2" id="how-it-works">
          How it works
        </h2>
        <p className="docs-p">
          When you create an API in Relay, you are given a unique Gateway URL
          (or you can attach a custom domain). You configure a target backend URL, and Relay
          transparently proxies traffic to that backend while executing middleware (auth, rate limits,
          logging) at the edge.
        </p>

        <h3 className="docs-h3" id="next-steps">
          Next steps
        </h3>
        <p className="docs-p">
          Ready to get started? Check out the guides below to deploy your first API behind Relay
          in under five minutes.
        </p>
        
        <div className="docs-grid">
          <DocsCard
            title="Quickstart"
            description="Deploy your first API behind Relay in under five minutes."
            href="/docs/introduction"
          />
          <DocsCard
            title="Authentication"
            description="Learn how to secure your APIs and issue tokens."
            href="/docs/introduction"
          />
          <DocsCard
            title="Environments"
            description="Manage configuration across dev, staging, and prod."
            href="/docs/introduction"
          />
        </div>
      </main>

      <DocsToc
        links={[
          { label: 'Why Relay?', href: '#why-relay' },
          { label: 'How it works', href: '#how-it-works' },
          { label: 'Next steps', href: '#next-steps' },
        ]}
      />
    </>
  );
}
