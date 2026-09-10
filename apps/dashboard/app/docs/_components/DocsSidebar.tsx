'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DocsSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => (pathname === path ? ' active' : '');

  return (
    <nav className="docs-nav">
      <div className="nav-group">
        <div className="nav-group-label">GETTING STARTED</div>
        <Link href="/docs/introduction" className={`nav-item${isActive('/docs/introduction')}`}>
          Introduction
        </Link>
        <div className="nav-item">Quickstart</div>
        <div className="nav-item">Authentication</div>
        <div className="nav-item">Environments</div>
      </div>
      <div className="nav-group">
        <div className="nav-group-label">API KEYS</div>
        <Link href="/docs/api-keys/create" className={`nav-item method${isActive('/docs/api-keys/create')}`}>
          <span className="m-tag post">POST</span>Create a key
        </Link>
        <Link href="/docs/api-keys/list" className={`nav-item method${isActive('/docs/api-keys/list')}`}>
          <span className="m-tag get">GET</span>List keys
        </Link>
        <Link href="/docs/api-keys/revoke" className={`nav-item method${isActive('/docs/api-keys/revoke')}`}>
          <span className="m-tag delete">DEL</span>Revoke a key
        </Link>
      </div>
      <div className="nav-group">
        <div className="nav-group-label">APIS & ENDPOINTS</div>
        <Link href="/docs/apis/list" className={`nav-item method${isActive('/docs/apis/list')}`}>
          <span className="m-tag get">GET</span>List APIs
        </Link>
        <Link href="/docs/apis/create" className={`nav-item method${isActive('/docs/apis/create')}`}>
          <span className="m-tag post">POST</span>Create an API
        </Link>
        <div className="nav-item method">
          <span className="m-tag get">GET</span>Get endpoint stats
        </div>
      </div>
      <div className="nav-group">
        <div className="nav-group-label">WEBHOOKS</div>
        <div className="nav-item">Overview</div>
        <div className="nav-item">Event types</div>
        <div className="nav-item">Verifying signatures</div>
      </div>
      <div className="nav-group">
        <div className="nav-group-label">REFERENCE</div>
        <div className="nav-item">Rate limits</div>
        <div className="nav-item">Errors</div>
        <div className="nav-item">SDKs & libraries</div>
      </div>
    </nav>
  );
}
