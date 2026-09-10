import './docs.css';
import { ReactNode } from 'react';
import { DocsTopbar } from './_components/DocsTopbar';
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
