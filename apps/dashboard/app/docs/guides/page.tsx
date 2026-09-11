import { DocsToc } from '../_components/DocsToc';
import { DocsCard } from '../_components/DocsCard';

export default function GuidesPage() {
  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Resources</div>
        <h1 className="docs-h1">Guides & Tutorials</h1>

        <p className="docs-lede">
          Step-by-step guides to help you integrate Relay with your favorite frameworks, 
          platforms, and architectures. Discover advanced patterns and best practices.
        </p>

        <h2 className="docs-h2" id="frameworks">
          Framework Guides
        </h2>
        <p className="docs-p">
          Learn how to drop Relay in front of your existing application stack.
        </p>

        <div className="docs-grid">
          <DocsCard
            title="Next.js App Router"
            description="Protect your Next.js API routes with Relay and verify webhooks."
            href="#"
          />
          <DocsCard
            title="Express & Node.js"
            description="Configure your Express backend to trust Relay edge limits."
            href="#"
          />
          <DocsCard
            title="Python FastAPI"
            description="Proxy traffic to FastAPI and consume JSON webhooks securely."
            href="#"
          />
        </div>

        <h2 className="docs-h2" id="advanced-patterns">
          Advanced Patterns
        </h2>
        <p className="docs-p">
          Go beyond the basics with architectural deep-dives.
        </p>

        <div className="docs-grid">
          <DocsCard
            title="Zero-Downtime Migrations"
            description="Use Relay environments to cut over databases with no downtime."
            href="#"
          />
          <DocsCard
            title="Custom Auth Strategies"
            description="Integrating third-party Identity Providers with Relay's Edge."
            href="#"
          />
          <DocsCard
            title="Global Rate Limiting"
            description="How to design rate limits for multi-tenant SaaS applications."
            href="#"
          />
        </div>
      </main>

      <DocsToc
        links={[
          { label: 'Framework Guides', href: '#frameworks' },
          { label: 'Advanced Patterns', href: '#advanced-patterns' },
        ]}
      />
    </>
  );
}
