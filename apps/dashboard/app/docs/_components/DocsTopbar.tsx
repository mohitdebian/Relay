'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DocsTopbar() {
  const pathname = usePathname();
  const isActive = (path: string) => (pathname.startsWith(path) ? ' active' : '');

  return (
    <header className="docs-topbar">
      <div className="docs-topbar-left">
        <Link href="/docs" className="logo">
          RELAY_
        </Link>
        <nav className="docs-topbar-nav">
          <Link href="/docs" className={pathname === '/docs' ? 'active' : ''}>Docs</Link>
          <Link href="/docs/api-keys/create" className={isActive('/docs/api-keys') || isActive('/docs/apis')}>
            API Reference
          </Link>
          <Link href="/docs/guides" className={isActive('/docs/guides')}>Guides</Link>
          <Link href="/docs/changelog" className={isActive('/docs/changelog')}>Changelog</Link>
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
  );
}
