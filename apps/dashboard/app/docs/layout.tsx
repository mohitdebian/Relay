import './docs.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { DocsTopbar } from './_components/DocsTopbar';

export const metadata: Metadata = {
  title: {
    template: '%s | Relay Documentation',
    default: 'Relay Documentation',
  },
  description: 'Learn how to route, secure, and monitor your APIs with Relay.',
};
import { DocsSidebar } from './_components/DocsSidebar';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell docs-shell">
      <DocsSidebar />
      <div className="main-col">
        <DocsTopbar />
        <div className="docs-content-layout">
          {children}
        </div>
      </div>
    </div>
  );
}
