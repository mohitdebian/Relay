import { getApisAction } from '@/app/actions/api';
import RateLimitsClient from './RateLimitsClient';
import Typewriter from '@/app/components/Typewriter';

export default async function RateLimitsPage() {
  const result = await getApisAction();

  if (!result.success || !result.apis) {
    return (
      <div className="section">
        <div className="panel">
          <div className="modal-warning">
            <span>⚠</span>
            <span>Failed to load APIs.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="RATE LIMITS" />
          </div>
          <div className="page-sub">Configure traffic controls for your APIs</div>
        </div>
      </div>
      <RateLimitsClient initialApis={result.apis} />
    </>
  );
}
