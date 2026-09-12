import Typewriter from '@/app/components/Typewriter';
const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');
import { getWorkspaceAnalyticsAction } from '@/app/actions/analytics';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const { analytics } = await getWorkspaceAnalyticsAction().catch((e) => {
    if (isRedirectError(e)) throw e;
    return { analytics: null };
  });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="ANALYTICS" />
          </div>
          <div className="page-sub">All time (Workspace Overview)</div>
        </div>
      </div>

      <AnalyticsClient analytics={analytics} />
    </>
  );
}
