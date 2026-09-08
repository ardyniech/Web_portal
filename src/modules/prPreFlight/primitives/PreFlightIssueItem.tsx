import React from 'react';
import { PreFlightIssue } from '../logic/types';
import { ArrowRight, Wrench, Loader2, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface PreFlightIssueItemProps {
  issue: PreFlightIssue;
  isFixing: boolean;
  onApplyFix: (issue: PreFlightIssue) => void;
}

export function PreFlightIssueItem({ issue, isFixing, onApplyFix }: PreFlightIssueItemProps) {
  const badgeStyle = (s: string) => {
    const map: Record<string, string> = {
      critical: 'bg-red-50 text-red-700 border-red-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      architectural: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return map[s] || 'bg-zinc-50 text-zinc-700 border-zinc-200';
  };

  const isSecurity = issue.category === 'security' || issue.severity === 'critical';

  return (
    <div className="p-2.5 bg-zinc-50/80 rounded-xl border border-zinc-200 flex flex-col gap-1.5 hover:border-zinc-300 transition-colors">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {isSecurity ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          ) : (
            <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          )}
          <span className="font-mono text-[9px] font-bold text-zinc-500 shrink-0">{issue.ruleId}</span>
          <span className="font-bold text-zinc-800 text-[11px] truncate">{issue.ruleName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${badgeStyle(issue.severity)}`}>
            {issue.severity}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
        {issue.message}
      </p>

      {issue.codeSnippet && (
        <pre className="text-[9px] bg-zinc-900 text-zinc-200 p-1.5 rounded font-mono overflow-x-auto">
          <code>{issue.codeSnippet}</code>
        </pre>
      )}

      <div className="p-1.5 bg-white border border-zinc-200/80 rounded-lg text-[9.5px] text-zinc-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">
            Solusi: <strong className="text-zinc-800 font-semibold">{issue.proposedFix}</strong>
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => onApplyFix(issue)}
          disabled={isFixing}
          icon={isFixing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Wrench className="w-2.5 h-2.5" />}
          className="h-5 text-[9px] px-2 font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shrink-0 font-sans"
        >
          {isFixing ? 'Fixing...' : 'Fix AI'}
        </Button>
      </div>

      <div className="text-[8.5px] text-zinc-400 font-mono truncate">
        Berkas: {issue.filePath}
      </div>
    </div>
  );
}
