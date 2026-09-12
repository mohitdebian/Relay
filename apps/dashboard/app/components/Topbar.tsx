import { fetchAPI } from '../lib/api';
import CommandPalette from './CommandPalette';
import UserMenu from './UserMenu';
import InboxBell from './InboxBell';

import { auth } from '@/app/lib/auth/server';

const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');

export default async function Topbar() {
  const session = await auth.getSession();
  const user = session && 'data' in session ? session.data?.user : (session as any)?.user;
  const email = user?.email || 'Unknown';
  const seed = email;
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`;

  // Fetch pending invitations for inbox
  const invitationsData = await fetchAPI('/invitations').catch((e) => {
    if (isRedirectError(e)) throw e;
    return { invitations: [] };
  });
  const invitations = invitationsData?.invitations || [];

  return (
    <header className="topbar">
      <CommandPalette />
      <div className="topbar-right">
        <div className="env-switcher">
          <span className="dot green"></span>
          <span>Production</span>
          <span className="chev">▾</span>
        </div>
        <InboxBell invitations={invitations} />
        <UserMenu email={email} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
