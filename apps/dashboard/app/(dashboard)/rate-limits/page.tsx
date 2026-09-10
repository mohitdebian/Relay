import Typewriter from '@/app/components/Typewriter';
export default function RateLimitsPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="RATE LIMITS" />
          </div>
          <div className="page-sub">0 active rules</div>
        </div>
        <button className="btn btn-primary">+ New rule</button>
      </div>
      <div className="panel">
        <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
          Rate limits feature is in beta. Configure rate limits on individual APIs.
        </div>
      </div>
    </>
  );
}
