import Typewriter from '@/app/components/Typewriter';
const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');
import { getMembersAction } from '@/app/actions/members';
import { InviteMemberButton } from '@/app/components/modals/InviteMemberModal';
import { RemoveMemberButton } from '@/app/components/RemoveMemberButton';

export default async function MembersPage() {
  const data_members: any = await getMembersAction().catch((e) => {
    if (isRedirectError(e)) throw e;
    return { members: [], invitations: [] };
  });
  const members = data_members?.members || [];
  const invitations = data_members?.invitations || [];
  const currentRole = data_members?.currentRole || 'Viewer';
  const currentUserId = data_members?.currentUserId || null;
  const canInvite = currentRole === 'OWNER' || currentRole === 'Admin';

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="MEMBERS" />
          </div>
          <div className="page-sub">{members?.length || 0} users in this workspace</div>
        </div>
        {canInvite && <InviteMemberButton />}
      </div>

      <div className="panel" style={{ padding: '14px 16px' }}>
        {members.map((m: any, i: number) => {
          const isLast = i === members.length - 1;
          const initials = m.email.substring(0, 2).toUpperCase();
          const name = m.name || m.email.split('@')[0];

          return (
            <div
              key={m.id || i}
              className="row"
              style={{
                gridTemplateColumns: '1.2fr 1fr .6fr .4fr',
                padding: '10px 0',
                borderBottom: isLast ? 'none' : '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    background: 'var(--border)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="c-strong">{name}</span>
                  <span className="c-secondary">{m.email}</span>
                </div>
              </div>
              <div className="c-secondary">
                <span className="tag">{m.role}</span>
              </div>
              <div className="c-secondary c-right">
                joined {new Date(m.created_at).toLocaleDateString()}
              </div>
              <div
                className="c-right"
                style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
              >
                {canInvite && m.id !== currentUserId && m.role !== 'OWNER' && (
                  <RemoveMemberButton userId={m.id} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {invitations.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div className="section-head" style={{ marginBottom: '16px' }}>
            <h2 className="section-title">Pending Invitations</h2>
          </div>
          <div className="panel" style={{ padding: '14px 16px' }}>
            {invitations.map((inv: any, i: number) => {
              const isLast = i === invitations.length - 1;
              const initials = inv.email.substring(0, 2).toUpperCase();

              return (
                <div
                  key={inv.id || i}
                  className="row"
                  style={{
                    gridTemplateColumns: '1.2fr 1fr .6fr',
                    padding: '10px 0',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        background: 'var(--border)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        opacity: 0.6,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="c-strong" style={{ opacity: 0.6 }}>
                        {inv.email}
                      </span>
                      <span className="c-secondary" style={{ fontSize: '11px' }}>
                        Invited on {new Date(inv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="c-secondary">
                    <span className="tag">{inv.role}</span>
                  </div>
                  <div className="c-secondary c-right" style={{ fontStyle: 'italic' }}>
                    Pending
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
