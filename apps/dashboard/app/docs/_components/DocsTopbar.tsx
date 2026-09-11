'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DocsTopbar() {
  const pathname = usePathname();
  const isActive = (path: string) => (pathname.startsWith(path) ? ' active' : '');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <nav className="topbar-nav">
          <Link href="/docs" className={pathname === '/docs' ? 'active' : ''}>Docs</Link>
          <Link href="/docs/api-keys/create" className={isActive('/docs/api-keys') || isActive('/docs/apis')}>
            API Reference
          </Link>
          <Link href="/docs/guides" className={isActive('/docs/guides')}>Guides</Link>
          <Link href="/docs/changelog" className={isActive('/docs/changelog')}>Changelog</Link>
        </nav>
      </div>
      <div className="topbar-right">
        <div className="search-btn">
          <span>Search docs…</span>
          <span className="kbd">⌘K</span>
        </div>
        <Link href="/overview" className="btn btn-primary">
          Dashboard →
        </Link>
      </div>
    </header>
  );
}
