import './docs.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="docs-topbar">
        <div className="docs-topbar-left">
          <Link href="/docs" className="logo">
            RELAY_
          </Link>
          <nav className="docs-topbar-nav">
            <Link href="/docs">Docs</Link>
            <Link href="/docs/api-keys/create" className="active">
              API Reference
            </Link>
            <Link href="/docs">Guides</Link>
            <Link href="/docs/changelog">Changelog</Link>
          </nav>
        </div>
        <div className="docs-topbar-right">
          <div className="search-btn">
            <span>Search docs…</span>
            <span className="kbd">⌘K</span>
          </div>
          <Link href="/overview" className="btn-dash">
            Dashboard →
          </Link>
        </div>
      </header>
      <div className="docs-shell">
        <nav className="docs-nav">
          <div className="docs-nav-group">
            <div className="docs-nav-group-label">GETTING STARTED</div>
            <Link href="/docs/introduction" className="docs-nav-item">
              Introduction
            </Link>
            <div className="docs-nav-item">Quickstart</div>
            <div className="docs-nav-item">Authentication</div>
            <div className="docs-nav-item">Environments</div>
          </div>
          <div className="docs-nav-group">
            <div className="docs-nav-group-label">API KEYS</div>
            <Link href="/docs/api-keys/create" className="docs-nav-item method active">
              <span className="docs-m-tag post">POST</span>Create a key
            </Link>
            <div className="docs-nav-item method">
              <span className="docs-m-tag get">GET</span>List keys
            </div>
            <div className="docs-nav-item method">
              <span className="docs-m-tag delete">DEL</span>Revoke a key
            </div>
          </div>
          <div className="docs-nav-group">
            <div className="docs-nav-group-label">APIS &amp; ENDPOINTS</div>
            <div className="docs-nav-item method">
              <span className="docs-m-tag get">GET</span>List APIs
            </div>
            <div className="docs-nav-item method">
              <span className="docs-m-tag post">POST</span>Create an API
            </div>
            <div className="docs-nav-item method">
              <span className="docs-m-tag get">GET</span>Get endpoint stats
            </div>
          </div>
          <div className="docs-nav-group">
            <div className="docs-nav-group-label">WEBHOOKS</div>
            <div className="docs-nav-item">Overview</div>
            <div className="docs-nav-item">Event types</div>
            <div className="docs-nav-item">Verifying signatures</div>
          </div>
          <div className="docs-nav-group">
            <div className="docs-nav-group-label">REFERENCE</div>
            <div className="docs-nav-item">Rate limits</div>
            <div className="docs-nav-item">Errors</div>
            <div className="docs-nav-item">SDKs &amp; libraries</div>
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
}
