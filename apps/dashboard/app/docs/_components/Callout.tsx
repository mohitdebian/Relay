import React from 'react';

export function Callout({
  children,
  variant = 'neutral',
}: {
  children: React.ReactNode;
  variant?: 'neutral' | 'warn';
}) {
  return <div className={`docs-callout ${variant === 'warn' ? 'warn' : ''}`}>{children}</div>;
}
