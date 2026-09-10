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

      <div className="filter-bar">
        <div className="filter-chip">API ▾</div>
        <div className="filter-chip">Method ▾</div>
        <div className="filter-chip">Status ▾</div>
      </div>

      <div className="panel">
        <div className="row row-head" style={{ gridTemplateColumns: '80px 70px 1.6fr 70px 70px' }}>
          <div>TIME</div>
          <div>METHOD</div>
          <div>PATH</div>
          <div className="c-right">STATUS</div>
          <div className="c-right">LATENCY</div>
        </div>

        {logs.map((log, i) => (
          <div
            key={i}
            className="row log-row"
            style={{ gridTemplateColumns: '80px 70px 1.6fr 70px 70px' }}
          >
            <span className="c-secondary mono">{log.time}</span>
            <span className={`method ${log.method.toLowerCase()}`}>{log.method}</span>
            <span
              className="mono"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {log.path}
            </span>
            <span className={`mono c-right ${log.status >= 400 ? 'status failing' : 'status ok'}`}>
              {log.status}
            </span>
            <span className="mono c-secondary c-right">{log.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
