import LogsClient from './LogsClient';

const logs = [
  { time: '12:04:11', method: 'GET', path: '/api/v1/workspaces', status: 200, latency: '45ms' },
  { time: '12:03:59', method: 'POST', path: '/api/v1/auth/login', status: 200, latency: '120ms' },
  { time: '12:01:23', method: 'GET', path: '/api/v1/users/me', status: 401, latency: '12ms' },
];

export default function LogsPage() {
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
