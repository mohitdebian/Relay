'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    ],
  },
  {
    label: 'SETTINGS',
    items: [{ name: 'General', href: '/settings' }],
  },
];

export default function Sidebar({ workspaces = [], activeWorkspaceId = '' }: { workspaces?: any[], activeWorkspaceId?: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/overview') return pathname === '/overview' || pathname === '/';
    if (href === '/apis') return pathname === '/apis' || pathname.startsWith('/apis/');
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
