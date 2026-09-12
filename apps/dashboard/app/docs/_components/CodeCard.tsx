'use client';

import { useState } from 'react';

type CodeTab = {
  label: string;
  code: React.ReactNode;
};

export default function CodeCard({ tabs }: { tabs: CodeTab[] }) {
  const [activeTab, setActiveTab] = useState(0);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // In a real implementation, you would copy the text content.
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="docs-code-card">
      {tabs.length > 1 && (
        <div className="docs-code-tabs">
          {tabs.map((tab, idx) => (
            <div
              key={idx}
              className={`docs-code-tab ${activeTab === idx ? 'active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}
      <div className="docs-code-body">
        <span className="docs-code-copy" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </span>
        {tabs[activeTab].code}
      </div>
    </div>
  );
}
