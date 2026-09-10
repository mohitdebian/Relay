import React from 'react';

export function ParamsTable({ children }: { children: React.ReactNode }) {
  return <div className="docs-params">{children}</div>;
}

export function ParamRow({
  name,
  required,
  type,
  description,
}: {
  name: string;
  required?: boolean;
  type: React.ReactNode;
  description: React.ReactNode;
}) {
  return (
    <div className="docs-param-row">
      <div className="docs-param-name">
        {name}
        {required && <span className="docs-param-req">required</span>}
      </div>
      <div className="docs-param-type">{type}</div>
      <div className="docs-param-desc">{description}</div>
    </div>
  );
}
