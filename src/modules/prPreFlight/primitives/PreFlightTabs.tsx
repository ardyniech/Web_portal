import React from 'react';
import { PreFlightIssue } from '../logic/types';

interface PreFlightTabsProps {
  activeTab: 'all' | 'security' | 'architecture';
  issues: PreFlightIssue[];
  onSelectTab: (tab: 'all' | 'security' | 'architecture') => void;
}

export function PreFlightTabs({ activeTab, issues, onSelectTab }: PreFlightTabsProps) {
  const securityCount = issues.filter((i) => i.category === 'security' || i.severity === 'critical').length;
  const archCount = issues.filter((i) => i.category === 'architecture' || i.severity === 'architectural').length;

  return (
    <div className="flex items-center justify-between border-b border-zinc-100 pb-1 pt-1">
      <div className="flex gap-1">
        <button
          onClick={() => onSelectTab('all')}
          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
            activeTab === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          Semua ({issues.length})
        </button>
        <button
          onClick={() => onSelectTab('security')}
          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
            activeTab === 'security' ? 'bg-rose-700 text-white' : 'text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          Keamanan ({securityCount})
        </button>
        <button
          onClick={() => onSelectTab('architecture')}
          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
            activeTab === 'architecture' ? 'bg-indigo-700 text-white' : 'text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          Arsitektur ({archCount})
        </button>
      </div>
    </div>
  );
}
