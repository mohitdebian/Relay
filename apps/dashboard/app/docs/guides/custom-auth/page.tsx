import { DocsToc } from '../../_components/DocsToc';

export default function CustomAuthPage() {
  return (
    <>
      <main className="docs-main">
        <div className="docs-breadcrumb">Guides</div>
        <h1 className="docs-h1">Custom Authentication</h1>

        <p className="docs-lede">
          Integrating third-party Identity Providers with Relay's Edge. Learn how to validate tokens
          from Auth0, Clerk, Firebase, and more before requests ever reach your backend.
        </p>

        <h2 className="docs-h2" id="overview">
          Overview
        </h2>
        <p className="docs-p">
          If you already have an Identity Provider (IdP) such as Auth0, Clerk, or Firebase, you can
          easily integrate it with Relay. Clients simply pass their{' '}
          <code className="docs-inline">Bearer</code> token in the{' '}
          <code className="docs-inline">Authorization</code> header when making a request.
        </p>
        <p className="docs-p">
          Relay's Edge validates the JWT signature against a configured JWKS (JSON Web Key Set)
          endpoint <strong>before</strong> the request reaches your backend. If the token is invalid
          or expired, Relay rejects the request automatically, protecting your upstream services
          from unauthenticated traffic.
        </p>

        <h2 className="docs-h2" id="how-it-works">
          How it works
        </h2>
        <ul
          className="docs-ul"
          style={{
            paddingLeft: '20px',
            marginBottom: '14px',
            fontSize: '15px',
            color: 'var(--text)',
            lineHeight: '1.65',
          }}
        >
          <li style={{ marginBottom: '6px' }}>
            <strong>Client:</strong> Obtains a JWT from your Identity Provider and includes it in
            the <code className="docs-inline">Authorization: Bearer &lt;token&gt;</code> header.
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Relay Edge:</strong> Intercepts the request and fetches the public keys from
            your configured JWKS endpoint.
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Validation:</strong> The edge validates the signature, expiration, and
            optionally the audience/issuer.
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Backend:</strong> Receives the validated request, ensuring that your backend
            only spends resources processing legitimate traffic.
          </li>
        </ul>

        <h2 className="docs-h2" id="configuration">
          Configuration
        </h2>
        <p className="docs-p">
          To enable custom authentication, you need to configure a JWKS URL in your API settings.
        </p>
        <ol
          className="docs-ul"
          style={{
            paddingLeft: '20px',
            marginBottom: '14px',
            fontSize: '15px',
            color: 'var(--text)',
            lineHeight: '1.65',
            listStyleType: 'decimal',
          }}
        >
          <li style={{ marginBottom: '6px' }}>
            Navigate to the <strong>Settings</strong> tab for your API in the Relay dashboard.
          </li>
          <li style={{ marginBottom: '6px' }}>
            Under <strong>Authentication</strong>, select <strong>Custom JWT (JWKS)</strong>.
          </li>
          <li style={{ marginBottom: '6px' }}>
            Provide the JWKS endpoint URL from your Identity Provider (e.g.,{' '}
            <code className="docs-inline">https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json</code>
            ).
          </li>
          <li style={{ marginBottom: '6px' }}>
            Save your settings. Relay will immediately begin validating tokens on incoming requests.
          </li>
        </ol>
      </main>

      <aside className="docs-side"></aside>

      <DocsToc
        links={[
          { label: 'Overview', href: '#overview' },
          { label: 'How it works', href: '#how-it-works' },
          { label: 'Configuration', href: '#configuration' },
        ]}
      />
    </>
  );
}
