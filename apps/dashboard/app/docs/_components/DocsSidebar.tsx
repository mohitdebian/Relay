'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DocsSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => (pathname === path ? ' active' : '');

  return (
    <nav className="docs-nav">
      <div className="docs-nav-group">
        <div className="docs-nav-group-label">GETTING STARTED</div>
        <Link href="/docs/introduction" className={`docs-nav-item${isActive('/docs/introduction')}`}>
          Introduction
        </Link>
        <div className="docs-nav-item">Quickstart</div>
        <div className="docs-nav-item">Authentication</div>
        <div className="docs-nav-item">Environments</div>
      </div>
      <div className="docs-nav-group">
        <div className="docs-nav-group-label">API KEYS</div>
        <Link href="/docs/api-keys/create" className={`docs-nav-item method${isActive('/docs/api-keys/create')}`}>
          <span className="docs-m-tag post">POST</span>Create a key
        </Link>
        <Link href="/docs/api-keys/list" className={`docs-nav-item method${isActive('/docs/api-keys/list')}`}>
          <span className="docs-m-tag get">GET</span>List keys
        </Link>
        <Link href="/docs/api-keys/revoke" className={`docs-nav-item method${isActive('/docs/api-keys/revoke')}`}>
          <span className="docs-m-tag delete">DEL</span>Revoke a key
        </Link>
      </div>
      <div className="docs-nav-group">
        <div className="docs-nav-group-label">APIS & ENDPOINTS</div>
        <Link href="/docs/apis/list" className={`docs-nav-item method${isActive('/docs/apis/list')}`}>
          <span className="docs-m-tag get">GET</span>List APIs
        </Link>
        <Link href="/docs/apis/create" className={`docs-nav-item method${isActive('/docs/apis/create')}`}>
          <span className="docs-m-tag post">POST</span>Create an API
        </Link>
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
        <div className="docs-nav-item">SDKs & libraries</div>
      </div>
    </nav>
  );
}
