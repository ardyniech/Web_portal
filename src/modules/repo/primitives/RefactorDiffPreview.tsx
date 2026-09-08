import React, { useState } from 'react';
import { RefactorProposal } from '../logic/aiRefactorTypes';
import { DiffView } from '../../diffViewer';
import { RefactorValidationBadge } from './RefactorValidationBadge';
import { RefactorFileTabs } from './RefactorFileTabs';
import { Brain, CheckCircle2, TrendingDown, Sparkles } from 'lucide-react';

interface RefactorDiffPreviewProps {
  proposal: RefactorProposal;
}

export function RefactorDiffPreview({ proposal }: RefactorDiffPreviewProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const changes = proposal.changes || [];
  const currentChange = changes[activeFileIndex] || changes[0];

  const before = proposal.lineCountBefore || (currentChange ? currentChange.originalCode.split('\n').length : 0);
  const after = proposal.lineCountAfter || (currentChange ? currentChange.refactoredCode.split('\n').length : 0);
  const diffLines = after - before;

  return (
    <div className="flex flex-col gap-3">
      {/* Proposal Summary & Metrics */}
      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            {proposal.title}
          </h4>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-purple-200 text-zinc-700">
              Sebelum: {before} baris
            </span>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-purple-200 text-emerald-700 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Sesudah: {after} baris ({diffLines >= 0 ? `+${diffLines}` : diffLines})
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-700 font-medium leading-relaxed">
          {proposal.summary}
        </p>

        {proposal.appliedMemories && proposal.appliedMemories.length > 0 && (
          <div className="pt-1.5 border-t border-purple-200/60 flex flex-col gap-1">
            <span className="text-[9.5px] font-bold text-purple-900 uppercase flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-600" /> Aturan SOP & Memori Diterapkan:
            </span>
            <div className="flex flex-wrap gap-1">
              {proposal.appliedMemories.map((mem, i) => (
                <span key={i} className="text-[9.5px] font-medium bg-white/80 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-purple-600" />
                  {mem}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Multi-File Tabs */}
      <RefactorFileTabs
        changes={changes}
        activeIndex={activeFileIndex}
        onSelect={setActiveFileIndex}
      />

      {/* AST Validation Status */}
      {currentChange && (
        <RefactorValidationBadge validation={currentChange.validation} />
      )}

      {/* Real Code Diff */}
      {currentChange ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-600 font-medium">
            <span>Berkas: <strong className="font-mono text-zinc-900">{currentChange.fileName}</strong></span>
            <span>{currentChange.reason}</span>
          </div>
          <DiffView
            fileName={currentChange.fileName}
            originalCode={currentChange.originalCode}
            modifiedCode={currentChange.refactoredCode}
          />
        </div>
      ) : (
        <div className="p-6 text-center text-zinc-400 text-xs">
          Belum ada perubahan kode yang dimuat.
        </div>
      )}
    </div>
  );
}
