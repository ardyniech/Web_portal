import React from 'react';
import { X, Eye, FileCode, CheckCircle2 } from 'lucide-react';
import { CodeProposalTarget } from '../logic/types';

interface AutoDevDiffViewerModalProps {
  target: CodeProposalTarget;
  onClose: () => void;
}

export function AutoDevDiffViewerModal({ target, onClose }: AutoDevDiffViewerModalProps) {
  const lines = target.codeSnippet ? target.codeSnippet.split('\n') : [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-4 text-white shadow-2xl flex flex-col gap-3 max-h-[85vh] text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-xs">{target.filePath}</span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[9px] rounded uppercase font-bold">
              {target.action}
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-zinc-400 font-medium">{target.description}</p>

        {/* Line-by-line Diff inspection box */}
        <div className="flex-1 overflow-y-auto bg-black p-3 rounded-xl font-mono text-[10px] border border-zinc-800 flex flex-col gap-0.5 max-h-[360px]">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2 text-emerald-300 hover:bg-zinc-900/60 px-1 rounded">
              <span className="text-zinc-600 w-6 text-right shrink-0 select-none">{idx + 1}</span>
              <span className="text-emerald-500 shrink-0 select-none">+</span>
              <span className="whitespace-pre-wrap break-all">{line}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-lg text-[10px] cursor-pointer"
          >
            Tutup Inspeksi Diff
          </button>
        </div>
      </div>
    </div>
  );
}
