'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import WorkspaceSwitcher from './WorkspaceSwitcher';

const navGroups = [
  {
    label: 'WORKSPACE',
    items: [
      { name: 'Overview', href: '/overview' },
      { name: 'APIs', href: '/apis' },
    ],
  },
  {
    label: 'USAGE',
    items: [{ name: 'Analytics', href: '/analytics' }],
  },
  {
    label: 'ACCESS',
    items: [
      { name: 'API Keys', href: '/keys' },
      { name: 'Webhooks', href: '/webhooks' },
    ],
  },
  {
    label: 'GOVERNANCE',
    items: [
      { name: 'Rate Limits', href: '/rate-limits' },
      { name: 'Members', href: '/members' },
      { name: 'Billing', href: '/billing' },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { name: 'General', href: '/settings' },
      { name: 'Personal Access Tokens', href: '/settings/keys' },
    ],
  },
  {
    label: 'RESOURCES',
    items: [
      { name: 'Documentation', href: '/docs' },
      { name: 'GitHub', href: 'https://github.com/mohitdebian/Relay', external: true, icon: 'github' },
    ],
  },
];

export default function Sidebar({
  workspaces = [],
  activeWorkspaceId = '',
}: {
  workspaces?: any[];
  activeWorkspaceId?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  function isActive(href: string) {
    if (href === '/overview') return pathname === '/overview' || pathname === '/';
    if (href === '/apis') return pathname === '/apis' || pathname.startsWith('/apis/');
    if (href === '/docs') return pathname === '/docs' || pathname.startsWith('/docs/');
    return pathname === href;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link href="/" className="logo">
          RELAY_
        </Link>
      </div>
      {workspaces.length > 0 && (
        <WorkspaceSwitcher workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
      )}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item: any) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive(item.href) ? ' active' : ''}`}
                style={item.icon ? { display: 'flex', alignItems: 'center', gap: '8px' } : undefined}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {item.icon === 'github' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                )}
                {item.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="dot green"></span>
        <span>Production</span>
      </div>
    </aside>
  );
}
