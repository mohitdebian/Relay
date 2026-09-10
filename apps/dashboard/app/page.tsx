import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/app/lib/auth/server';
import './landing.css';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const session = await auth.getSession();

  if (session?.data) {
    redirect('/overview');
  }

  return (
    <div className="landing-body">
      {/* ============ NAV ============ */}
      <nav className="nav">
        <div className="wrap">
          <div className="nav-left">
            <span className="logo">RELAY_</span>
            <div className="nav-links">
              <a href="#features">Product</a>
              <a href="#pricing">Pricing</a>
              <a href="#">Docs</a>
              <a href="#">Changelog</a>
            </div>
          </div>
          <div className="nav-right">
            <Link className="btn btn-secondary" href="/login">
              Sign in
            </Link>
            <Link className="btn btn-primary" href="/login">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="kicker">API INFRASTRUCTURE</div>
              <h1>Route, secure, and monitor every API your team ships.</h1>
              <p className="lede">
                One dashboard for gateways, keys, rate limits, and traffic — so your team spends
                less time gluing infrastructure together and more time shipping.
              </p>
              <div className="hero-ctas">
                <Link className="btn btn-primary btn-lg" href="/login">
                  Get started →
                </Link>
                <a className="btn btn-secondary btn-lg" href="#">
                  View docs
                </a>
              </div>
              <div className="hero-meta">No credit card required · free up to 100K requests/mo</div>
            </div>
          </div>

          <div className="mock-frame">
            <div className="mock-topbar">
              <span className="mono">relay.sh/acme-workspace/overview</span>
            </div>
            <div className="mock-body">
              <div className="stat-row">
                <div className="stat">
                  <div className="stat-label">Requests (24h)</div>
                  <div className="stat-value">48.2K</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Success rate</div>
                  <div className="stat-value" style={{ color: 'var(--green)' }}>
                    99.82%
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-label">p95 latency</div>
                  <div className="stat-value">42ms</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Active API keys</div>
                  <div className="stat-value">11</div>
                </div>
              </div>
              <div className="panel">
                <div
                  className="row row-head"
                  style={{ gridTemplateColumns: '1.4fr .8fr .8fr .7fr' }}
                >
                  <div>API</div>
                  <div>Env</div>
                  <div>Requests</div>
                  <div className="c-right">Status</div>
                </div>
                <div className="row" style={{ gridTemplateColumns: '1.4fr .8fr .8fr .7fr' }}>
                  <div className="c-strong">payments-api</div>
                  <div>
                    <span className="tag">Production</span>
                  </div>
                  <div className="c-mono c-secondary">21.4K</div>
                  <div className="c-right">
                    <span className="status healthy">
                      <span className="dot green"></span>Healthy
                    </span>
                  </div>
                </div>
                <div className="row" style={{ gridTemplateColumns: '1.4fr .8fr .8fr .7fr' }}>
                  <div className="c-strong">notifications-api</div>
                  <div>
                    <span className="tag">Production</span>
                  </div>
                  <div className="c-mono c-secondary">14.9K</div>
                  <div className="c-right">
                    <span className="status healthy">
                      <span className="dot green"></span>Healthy
                    </span>
                  </div>
                </div>
                <div className="row" style={{ gridTemplateColumns: '1.4fr .8fr .8fr .7fr' }}>
                  <div className="c-strong">internal-reporting</div>
                  <div>
                    <span className="tag">Staging</span>
                  </div>
                  <div className="c-mono c-secondary">6.1K</div>
                  <div className="c-right">
                    <span className="status healthy">
                      <span className="dot green"></span>Healthy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOGOS ============ */}
      <section className="logos">
        <div className="wrap">
          <div className="kicker">USED BY ENGINEERING TEAMS AT</div>
          <div className="logo-strip">
            <span>NORTHWIND</span>
            <span>VOLT</span>
            <span>ARCHIVE&nbsp;CO</span>
            <span>LEDGERLY</span>
            <span>PING</span>
            <span>ORBITAL</span>
          </div>
        </div>
      </section>

      {/* ============ PLATFORM STATS ============ */}
      <section className="block stats-section">
        <div className="wrap">
          <div className="stat-row">
            <div className="stat">
              <div className="stat-label">Requests routed / month</div>
              <div className="stat-value">4.8B</div>
            </div>
            <div className="stat">
              <div className="stat-label">Platform uptime</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>
                99.99%
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Median added latency</div>
              <div className="stat-value">6ms</div>
            </div>
            <div className="stat">
              <div className="stat-label">Teams on Relay</div>
              <div className="stat-value">1,240</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="block" id="features">
        <div className="wrap">
          <div className="block-head">
            <div className="kicker">WHAT RELAY_ DOES</div>
            <h2>Everything between your service and the internet.</h2>
            <p>
              Three things you need for any production API, built to work together instead of bolted
              on separately.
            </p>
          </div>
          <div className="feature-grid">
            <div className="panel feature-panel">
              <div className="f-title">Routing &amp; gateways</div>
              <div className="f-desc">
                Put every API behind one edge — custom domains, versioned endpoints, and
                zero-downtime cutovers.
              </div>
              <ul>
                <li>
                  <span className="m">›</span>Custom domains with managed SSL
                </li>
                <li>
                  <span className="m">›</span>Per-endpoint rate limits
                </li>
                <li>
                  <span className="m">›</span>Blue/green deploys
                </li>
              </ul>
            </div>
            <div className="panel feature-panel">
              <div className="f-title">Auth &amp; policy</div>
              <div className="f-desc">
                Scope keys per environment, enforce CORS and IP allowlists, and roll a leaked key
                without a deploy.
              </div>
              <ul>
                <li>
                  <span className="m">›</span>Environment-scoped API keys
                </li>
                <li>
                  <span className="m">›</span>CORS &amp; IP allowlist policies
                </li>
                <li>
                  <span className="m">›</span>Instant key rotation
                </li>
              </ul>
            </div>
            <div className="panel feature-panel">
              <div className="f-title">Observability</div>
              <div className="f-desc">
                Every request logged with full headers, body, and timing — searchable the moment it
                happens.
              </div>
              <ul>
                <li>
                  <span className="m">›</span>Full request/response logs
                </li>
                <li>
                  <span className="m">›</span>Per-endpoint latency &amp; error rate
                </li>
                <li>
                  <span className="m">›</span>Threshold alerts to Slack/webhook
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CODE ============ */}
      <section className="block">
        <div className="wrap">
          <div className="block-head">
            <div className="kicker">BUILT FOR HOW YOU SHIP</div>
            <h2>One request to get a production-grade endpoint.</h2>
          </div>
          <div className="code-grid">
            <div className="code-block">
              <span className="cm">$</span> curl{' '}
              <span className="ck">https://api.acme.relay.sh/v1/users</span> \
              <span className="cm"> </span>-H{' '}
              <span className="cs">"Authorization: Bearer sk_live_9f2a...c81"</span>
              <span className="cm">{`\n{\n`}</span>
              <span className="cm"> "status":</span> <span className="cs">200</span>
              <span className="cm">,</span>
              <span className="cm"> "latency_ms":</span> <span className="cs">38</span>
              <span className="cm">,</span>
              <span className="cm"> "region":</span> <span className="cs">"iad1"</span>
              <span className="cm">,</span>
              <span className="cm"> "data": [ … ]</span>
              <span className="cm">{`\n}`}</span>
            </div>
            <div className="code-points">
              <div className="code-point">
                <div className="cp-title">Connect your existing service</div>
                <div className="cp-desc">
                  Point a route at your origin — no SDK, no code changes on your service.
                </div>
              </div>
              <div className="code-point">
                <div className="cp-title">Get a scoped key in seconds</div>
                <div className="cp-desc">
                  Keys are environment-scoped from the start, so staging traffic can never touch
                  production.
                </div>
              </div>
              <div className="code-point">
                <div className="cp-title">Watch it in the request log</div>
                <div className="cp-desc">
                  Every call — headers, body, response, latency — searchable the moment it lands.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="block" id="pricing">
        <div className="wrap">
          <div className="block-head">
            <div className="kicker">PRICING</div>
            <h2>Start free. Pay for usage as you grow.</h2>
          </div>
          <div className="pricing-grid">
            <div className="panel plan">
              <div className="plan-name-row">
                <div className="plan-name">Free</div>
              </div>
              <div className="plan-price">
                $0<span> /mo</span>
              </div>
              <div className="plan-desc">For side projects and evaluating Relay.</div>
              <ul>
                <li>
                  <span className="m">✓</span>100K requests / month
                </li>
                <li>
                  <span className="m">✓</span>1 environment
                </li>
                <li>
                  <span className="m">✓</span>7-day log retention
                </li>
                <li>
                  <span className="m">✓</span>Community support
                </li>
              </ul>
              <Link className="btn btn-secondary" href="/login">
                Get started
              </Link>
            </div>
            <div className="panel plan highlight">
              <div className="plan-name-row">
                <div className="plan-name">Team</div>
                <span className="tag">Most teams</span>
              </div>
              <div className="plan-price">
                $49<span> /mo</span>
              </div>
              <div className="plan-desc">For teams running production traffic.</div>
              <ul>
                <li>
                  <span className="m">✓</span>5M requests / month
                </li>
                <li>
                  <span className="m">✓</span>Unlimited environments
                </li>
                <li>
                  <span className="m">✓</span>90-day log retention
                </li>
                <li>
                  <span className="m">✓</span>Custom domains
                </li>
                <li>
                  <span className="m">✓</span>Email + Slack support
                </li>
              </ul>
              <Link className="btn btn-primary" href="/login">
                Get started
              </Link>
            </div>
            <div className="panel plan">
              <div className="plan-name-row">
                <div className="plan-name">Enterprise</div>
              </div>
              <div className="plan-price mono" style={{ fontSize: '18px' }}>
                Custom
              </div>
              <div className="plan-desc">For platforms with compliance and scale needs.</div>
              <ul>
                <li>
                  <span className="m">✓</span>Unlimited requests
                </li>
                <li>
                  <span className="m">✓</span>SSO &amp; audit logs
                </li>
                <li>
                  <span className="m">✓</span>1-year log retention
                </li>
                <li>
                  <span className="m">✓</span>Dedicated support
                </li>
              </ul>
              <a className="btn btn-secondary" href="#">
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="closing">
        <div className="wrap">
          <div className="closing-row">
            <div>
              <h2>Ready to ship faster?</h2>
              <p>Set up your first API route in under five minutes.</p>
            </div>
            <div className="closing-ctas">
              <Link className="btn btn-primary btn-lg" href="/login">
                Get started →
              </Link>
              <a className="btn btn-secondary btn-lg" href="#">
                View docs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">RELAY_</div>
              <p>
                API infrastructure for teams shipping fast — routing, auth, and observability in one
                place.
              </p>
            </div>
            <div className="footer-col">
              <div className="footer-col-label">PRODUCT</div>
              <a href="#">Overview</a>
              <a href="#">API Keys</a>
              <a href="#">Analytics</a>
              <a href="#">Pricing</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-label">DEVELOPERS</div>
              <a href="#">Documentation</a>
              <a href="#">API reference</a>
              <a href="#">Changelog</a>
              <a href="#">Status</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-label">COMPANY</div>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-label">LEGAL</div>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Relay, Inc.</span>
            <span className="footer-status">
              <span className="dot green"></span>All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
