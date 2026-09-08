import React from 'react';
import { Code2, FileCode } from 'lucide-react';
import { CodeProposalTarget } from '../logic/types';

interface AutoDevProposalCardProps {
  proposal: {
    summary: string;
    commitMessage: string;
    targets: CodeProposalTarget[];
  };
}

export function AutoDevProposalCard({ proposal }: AutoDevProposalCardProps) {
  return (
    <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-purple-950 text-[11px] flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-purple-700" /> Proposal Hasil Sintesis AI
        </span>
        <span className="text-[9px] font-mono font-bold bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded">
          {proposal.commitMessage}
        </span>
      </div>
      <p className="text-[10px] text-purple-900 font-medium">{proposal.summary}</p>

      <div className="flex flex-col gap-1.5 mt-1">
        {proposal.targets.map((tgt, idx) => (
          <div key={idx} className="p-2 bg-white border border-purple-200 rounded-lg flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9.5px] font-mono font-bold text-zinc-800">
              <span className="flex items-center gap-1 text-indigo-700">
                <FileCode className="w-3 h-3 text-indigo-500" /> {tgt.filePath}
              </span>
              <span className="uppercase px-1 bg-zinc-100 rounded text-zinc-600">{tgt.action}</span>
            </div>
            <p className="text-[9.5px] text-zinc-600">{tgt.description}</p>
            {tgt.codeSnippet && (
              <pre className="p-1.5 bg-zinc-900 text-emerald-300 font-mono text-[8.5px] rounded overflow-x-auto max-h-24">
                {tgt.codeSnippet}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
