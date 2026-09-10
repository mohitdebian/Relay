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
      { name: 'Endpoints', href: '/endpoints' },
      { name: 'Domains', href: '/domains' },
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
      { name: 'Policies', href: '/policies' },
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
    items: [{ name: 'General', href: '/settings' }],
  },
  {
    label: 'RESOURCES',
    items: [{ name: 'Documentation', href: '/docs' }],
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
        <span className="logo">RELAY_</span>
      </div>
      {workspaces.length > 0 && (
        <WorkspaceSwitcher workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
      )}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive(item.href) ? ' active' : ''}`}
              >
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
