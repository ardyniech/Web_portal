import React from 'react';
import { GitCommit } from 'lucide-react';

interface PreFlightCommitBarProps {
  commitMessage: string;
  commitHash: string;
}

export function PreFlightCommitBar({ commitMessage, commitHash }: PreFlightCommitBarProps) {
  return (
    <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-xl border border-zinc-200">
      <div className="flex items-center gap-2 min-w-0">
        <GitCommit className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <div className="min-w-0">
          <p className="font-bold text-[9px] text-zinc-400 uppercase leading-none">Target Komit / Staging</p>
          <p className="text-zinc-800 font-semibold truncate mt-0.5 text-[11px]">{commitMessage}</p>
        </div>
      </div>
      <span className="text-[10px] font-mono text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200 shrink-0">
        {commitHash}
      </span>
    </div>
  );
}
