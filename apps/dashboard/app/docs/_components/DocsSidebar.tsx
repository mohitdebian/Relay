'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DocsSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => (pathname === path ? ' active' : '');

  return (
    <aside className="sidebar docs-sidebar">
      <div className="sidebar-brand">
        <Link href="/docs" className="logo">
          RELAY_
        </Link>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-group-label">GETTING STARTED</div>
          <Link href="/docs/introduction" className={`nav-item${isActive('/docs/introduction')}`}>
            Introduction
          </Link>
          <Link href="/docs/quickstart" className={`nav-item${isActive('/docs/quickstart')}`}>
            Quickstart
          </Link>
          <Link href="/docs/authentication" className={`nav-item${isActive('/docs/authentication')}`}>
            Authentication
          </Link>
          <Link href="/docs/environments" className={`nav-item${isActive('/docs/environments')}`}>
            Environments
          </Link>
        </div>
        <div className="nav-group">
          <div className="nav-group-label">API KEYS</div>
          <Link href="/docs/api-keys/create" className={`nav-item method${isActive('/docs/api-keys/create')}`}>
            <span className="m-tag post">POST</span>Create API key
          </Link>
          <Link href="/docs/api-keys/list" className={`nav-item method${isActive('/docs/api-keys/list')}`}>
            <span className="m-tag get">GET</span>List API keys
          </Link>
          <Link href="/docs/api-keys/revoke" className={`nav-item method${isActive('/docs/api-keys/revoke')}`}>
            <span className="m-tag delete">DEL</span>Revoke API key
          </Link>
        </div>
        <div className="nav-group">
          <div className="nav-group-label">APIS & ENDPOINTS</div>
          <Link href="/docs/apis/list" className={`nav-item method${isActive('/docs/apis/list')}`}>
            <span className="m-tag get">GET</span>List APIs
          </Link>
          <Link href="/docs/apis/create" className={`nav-item method${isActive('/docs/apis/create')}`}>
            <span className="m-tag post">POST</span>Create API Route
          </Link>
        </div>
        <div className="nav-group">
          <div className="nav-group-label">WEBHOOKS</div>
          <Link href="/docs/webhooks/overview" className={`nav-item${isActive('/docs/webhooks/overview')}`}>
            Overview
          </Link>
          <Link href="/docs/webhooks/event-types" className={`nav-item${isActive('/docs/webhooks/event-types')}`}>
            Event types
          </Link>
          <Link href="/docs/webhooks/signatures" className={`nav-item${isActive('/docs/webhooks/signatures')}`}>
            Verifying signatures
          </Link>
        </div>
        <div className="nav-group">
          <div className="nav-group-label">REFERENCE</div>
          <Link href="/docs/reference/rate-limits" className={`nav-item${isActive('/docs/reference/rate-limits')}`}>
            Rate limits
          </Link>
          <Link href="/docs/reference/errors" className={`nav-item${isActive('/docs/reference/errors')}`}>
            Errors
          </Link>
          <Link href="/docs/reference/sdks" className={`nav-item${isActive('/docs/reference/sdks')}`}>
            SDKs & libraries
          </Link>
        </div>
      </nav>
    </aside>
  );
}
