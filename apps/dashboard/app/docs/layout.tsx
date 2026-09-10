import './docs.css';
import { ReactNode } from 'react';
import { DocsTopbar } from './_components/DocsTopbar';
import { DocsSidebar } from './_components/DocsSidebar';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <DocsTopbar />
      <div className="docs-shell">
        <DocsSidebar />
        {children}
      </div>
    </div>
  );
}
