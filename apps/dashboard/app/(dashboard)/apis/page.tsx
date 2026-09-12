import Typewriter from '@/app/components/Typewriter';
const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');
import Link from 'next/link';
import { fetchAPI } from '@/app/lib/api';
import { NewApiButton } from '@/app/components/modals/NewApiModal';
import ApisClient from './ApisClient';

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

      <ApisClient initialApis={apis} />
    </>
  );
}
