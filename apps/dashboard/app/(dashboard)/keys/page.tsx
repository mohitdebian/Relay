import Typewriter from '@/app/components/Typewriter';
const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');
import { fetchAPI } from '@/app/lib/api';
import { CreateKeyButton } from '@/app/components/modals/CreateKeyModal';

const environments = ['production', 'staging', 'development'] as const;

export default async function KeysPage() {
  const { apis } = await fetchAPI('/apis').catch((e) => {
    if (isRedirectError(e)) throw e;
    return { apis: [] };
  });
  const safeApis = apis || [];

  let allKeys: any[] = [];
  if (safeApis.length > 0) {
    const keysPromises = safeApis.map((api: any) =>
      fetchAPI(`/apis/${api.id}/keys`).catch((e) => {
        if (isRedirectError(e)) throw e;
        return {};
      })
    );
    const keysResults = await Promise.all(keysPromises);
    keysResults.forEach((res) => {
      if (res.keys) allKeys = [...allKeys, ...res.keys];
    });
  }

  // Group by environment
  const groupedKeys: Record<string, any[]> = {
    production: [],
    staging: [],
    development: [],
  };

  allKeys.forEach((key) => {
    const env = key.environment || 'production';
    if (!groupedKeys[env]) groupedKeys[env] = [];
    groupedKeys[env].push(key);
  });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="API KEYS" />
          </div>
          <div className="page-sub">{allKeys.length} active keys</div>
        </div>
        <CreateKeyButton />
      </div>

      {environments.map((env) => (
        <div className="section" key={env}>
          <div className="section-head">
            <div className="section-title" style={{ textTransform: 'capitalize' }}>
              {env}
            </div>
          </div>
          <div className="panel">
            {groupedKeys[env]?.map((k) => (
              <div key={k.id} className="row" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                <div className="c-strong">{k.name}</div>
                <div className="c-secondary mono">{k.key_prefix}</div>
                <div className="c-secondary c-right">
                  created {new Date(k.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {groupedKeys[env]?.length === 0 && (
              <div className="row" style={{ padding: '16px' }}>
                <span className="c-secondary">
                  No keys in this environment.<span className="cursor-blink"></span>
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
