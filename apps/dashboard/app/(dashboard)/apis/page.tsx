import Typewriter from '@/app/components/Typewriter';
const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');
import Link from 'next/link';
import { fetchAPI } from '@/app/lib/api';
import { NewApiButton } from '@/app/components/modals/NewApiModal';

export default async function ApisPage() {
  const { apis = [] } = await fetchAPI('/apis').catch((e) => {
    if (isRedirectError(e)) throw e;
    return {};
  });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="APIS" />
          </div>
          <div className="page-sub">{apis.length} APIs across multiple environments</div>
        </div>
        <NewApiButton />
      </div>

      <div className="filter-bar">
        <div className="filter-chip">Environment ▾</div>
        <div className="filter-chip">Type ▾</div>
        <div className="filter-chip">Status ▾</div>
      </div>

      <div className="panel">
        {apis.length === 0 && (
          <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
            No APIs found. Create one to get started.<span className="cursor-blink"></span>
          </div>
        )}
        {apis.map((api: any) => (
          <Link
            key={api.id}
            href={`/apis/${api.id}`}
            className="row clickable"
            style={{ gridTemplateColumns: '1.6fr .8fr .8fr .8fr .7fr' }}
          >
            <div>
              <div className="c-strong">{api.name}</div>
              <div className="c-secondary">
                REST · v1 <span className="tag">{api.environment}</span>
              </div>
            </div>
            <div>
              <div className="c-label">REQUESTS</div>
              <div className="c-mono">---</div>
            </div>
            <div>
              <div className="c-label">LATENCY</div>
              <div className="c-mono">---</div>
            </div>
            <div>
              <div className="c-label">UPTIME</div>
              <div className="c-mono">---</div>
            </div>
            <div className={`status ${api.status || 'healthy'} c-right`}>
              <span
                className={`dot ${(api.status || 'healthy') === 'healthy' ? 'green' : 'yellow'}`}
              ></span>
              {(api.status || 'healthy') === 'healthy' ? 'Healthy' : 'Degraded'}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
