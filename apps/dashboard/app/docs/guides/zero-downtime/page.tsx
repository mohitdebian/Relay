import { DocsToc } from '../../_components/DocsToc';

export default function ZeroDowntimePage() {
  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Guides</div>
        <h1 className="docs-h1">Zero-Downtime Database Migrations</h1>

        <p className="docs-lede">Use Relay environments to cut over databases with no downtime.</p>

        <h2 className="docs-h2" id="advanced-patterns">
          Advanced Patterns
        </h2>
        <p className="docs-p">
          Database migrations can be risky and often require maintenance windows. By leveraging
          Relay's environment routing, you can seamlessly cut over to a new database without
          downtime.
        </p>

        <h3 className="docs-h3" id="step-1">
          1. Deploy backend v2
        </h3>
        <p className="docs-p">
          Deploy a new version of your backend (v2) on a new server. This new backend should connect
          directly to your new database instance.
        </p>

        <h3 className="docs-h3" id="step-2">
          2. Update staging environment
        </h3>
        <p className="docs-p">
          Update the Relay <code className="docs-inline">staging</code> environment to point to the
          v2 backend URL. Your production traffic remains unaffected.
        </p>

        <h3 className="docs-h3" id="step-3">
          3. Test
        </h3>
        <p className="docs-p">
          Run your integration and end-to-end tests against the staging environment to verify that
          the new database and backend v2 are functioning correctly.
        </p>

        <h3 className="docs-h3" id="step-4">
          4. Update production environment
        </h3>
        <p className="docs-p">
          Once you are confident in the staging deployment, update the Relay{' '}
          <code className="docs-inline">production</code> environment upstream URL to point to v2.
        </p>

        <h3 className="docs-h3" id="step-5">
          5. Instant traffic switch
        </h3>
        <p className="docs-p">
          Traffic switches instantly to the new backend and database without any DNS propagation
          delays. Your users experience zero downtime.
        </p>
      </main>

      <aside className="docs-side"></aside>

      <DocsToc
        links={[
          { label: 'Advanced Patterns', href: '#advanced-patterns' },
          { label: '1. Deploy backend v2', href: '#step-1' },
          { label: '2. Update staging', href: '#step-2' },
          { label: '3. Test', href: '#step-3' },
          { label: '4. Update production', href: '#step-4' },
          { label: '5. Instant switch', href: '#step-5' },
        ]}
      />
    </>
  );
}
