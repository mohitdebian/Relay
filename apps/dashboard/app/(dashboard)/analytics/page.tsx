import Typewriter from '@/app/components/Typewriter';
import { getWorkspaceAnalyticsAction } from '@/app/actions/analytics';
import AnalyticsClient from './AnalyticsClient';

const isRedirectError = (e: unknown): boolean => {
  if (typeof e === 'object' && e !== null && 'digest' in e) {
    const err = e as { digest: string };
    return typeof err.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT');
  }
  return false;
};

export default async function AnalyticsPage() {
  const { analytics } = await getWorkspaceAnalyticsAction().catch((e: unknown) => {
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
