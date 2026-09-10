import React from 'react';

export function EndpointBadge({
  method,
  path,
}: {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  path: string;
}) {
  const methodClass = method.toLowerCase();
  return (
    <div className="endpoint-badge">
      <span className={`m ${methodClass}`}>{method}</span>
      <span>{path}</span>
    </div>
  );
}
