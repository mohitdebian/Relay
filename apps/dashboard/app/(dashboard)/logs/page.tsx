import { fetchAPI } from '@/app/lib/api';
import LogsClient from './LogsClient';

export default async function LogsPage() {
  let logs: any[] = [];
  try {
    const logsRes = await fetchAPI('/logs');
    if (logsRes.logs) logs = logsRes.logs;
  } catch (e) {
    console.error('Failed to fetch logs', e);
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">LOGS</h1>
        <div className="page-sub">Recent request activity</div>
      </div>

      <LogsClient initialLogs={logs} />
    </div>
  );
}
