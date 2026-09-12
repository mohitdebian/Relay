'use client';

import { useState } from 'react';
import { updateApiAction } from '@/app/actions/api';

interface Api {
  id: number;
  name: string;
  slug: string;
  rate_limit_enabled: boolean;
  rate_limit_max: number;
  rate_limit_window: number;
  environment: string;
}

export default function RateLimitsClient({ initialApis }: { initialApis: Api[] }) {
  const [apis, setApis] = useState<Api[]>(initialApis);
  const [savingId, setSavingId] = useState<number | null>(null);

  const handleUpdate = (apiId: number, field: keyof Api, value: any) => {
    setApis(apis.map((api) => (api.id === apiId ? { ...api, [field]: value } : api)));
  };

  const handleSave = async (api: Api) => {
    setSavingId(api.id);
    const result = await updateApiAction(api.id, {
      rate_limit_enabled: api.rate_limit_enabled,
      rate_limit_max: Number(api.rate_limit_max),
      rate_limit_window: Number(api.rate_limit_window),
    });
    setSavingId(null);
    if (!result.success) {
      alert(`Failed to save: ${result.error}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-12">
      {apis.map((api) => (
        <div 
          key={api.id} 
          className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
        >
          {/* Top colored accent line */}
          <div className={`absolute top-0 left-0 h-1 w-full transition-colors ${api.rate_limit_enabled ? 'bg-black' : 'bg-transparent group-hover:bg-[var(--border-strong)]'}`} />
          
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] tracking-tight flex items-center gap-3">
                  {api.name}
                  <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                    {api.environment}
                  </span>
                </h3>
                <p className="mt-1 text-sm text-[var(--text-tertiary)] font-mono bg-[var(--bg)] inline-block px-2 py-1 rounded">
                  {api.slug}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${api.rate_limit_enabled ? 'text-[var(--text)]' : 'text-[var(--text-tertiary)]'}`}>
                  {api.rate_limit_enabled ? 'Active' : 'Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdate(api.id, 'rate_limit_enabled', !api.rate_limit_enabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                    api.rate_limit_enabled ? 'bg-black' : 'bg-[var(--border-strong)]'
                  }`}
                  role="switch"
                  aria-checked={api.rate_limit_enabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      api.rate_limit_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-end transition-opacity duration-300 ${api.rate_limit_enabled ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
              <div className="lg:col-span-4">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Max Requests
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    disabled={!api.rate_limit_enabled}
                    value={api.rate_limit_max}
                    onChange={(e) => handleUpdate(api.id, 'rate_limit_max', e.target.value)}
                    className="block w-full rounded-lg border border-[var(--border-strong)] px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-[var(--bg)] disabled:text-[var(--text-secondary)]"
                    placeholder="e.g. 100"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 sm:text-sm text-[var(--text-tertiary)]">reqs</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Time Window
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    disabled={!api.rate_limit_enabled}
                    value={api.rate_limit_window}
                    onChange={(e) => handleUpdate(api.id, 'rate_limit_window', e.target.value)}
                    className="block w-full rounded-lg border border-[var(--border-strong)] px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-[var(--bg)] disabled:text-[var(--text-secondary)]"
                    placeholder="e.g. 60"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 sm:text-sm text-[var(--text-tertiary)]">secs</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex lg:justify-end mt-4 lg:mt-0">
                <button
                  className={`w-full lg:w-auto inline-flex justify-center items-center rounded-lg px-6 py-2.5 text-sm font-semibold transition-all shadow-sm ${
                    savingId === api.id 
                      ? 'bg-[var(--border)] text-[var(--text-tertiary)] cursor-wait shadow-none' 
                      : 'bg-black text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
                  }`}
                  onClick={() => handleSave(api)}
                  disabled={savingId === api.id || !api.rate_limit_enabled}
                >
                  {savingId === api.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {apis.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-transparent p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-[var(--text)]">No APIs configured</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Get started by creating a new API in your workspace to manage its rate limits.</p>
        </div>
      )}
    </div>
  );
}
