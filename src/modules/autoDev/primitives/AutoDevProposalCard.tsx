import React, { useState } from 'react';
import { Code2, FileCode, CheckCircle2, Play, Eye } from 'lucide-react';
import { CodeProposalTarget } from '../logic/types';
import { autoDevApi } from '../storage/autoDevApi';
import { dispatcher } from '../../../core/dispatcher';
import { AutoDevDiffViewerModal } from './AutoDevDiffViewerModal';

interface AutoDevProposalCardProps {
  proposal: {
    summary: string;
    commitMessage: string;
    targets: CodeProposalTarget[];
  };
}

export function AutoDevProposalCard({ proposal }: AutoDevProposalCardProps) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [selectedDiffTarget, setSelectedDiffTarget] = useState<CodeProposalTarget | null>(null);

  const handleApply = async () => {
    setApplying(true);
    try {
      await autoDevApi.applyProposal(proposal.targets);
      setApplied(true);
      dispatcher.emit('git:status_updated', {});
    } catch (err) {
      console.error('[Module:AutoDev] Error applying proposal:', err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-purple-950 text-[11px] flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-purple-700" /> Proposal Hasil Sintesis AI
        </span>
        <button
          onClick={handleApply}
          disabled={applying || applied}
          className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all ${
            applied ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
          }`}
        >
          {applied ? <><CheckCircle2 className="w-3 h-3" /> <span>Telah Diterapkan!</span></> : <><Play className={`w-3 h-3 ${applying ? 'animate-spin' : ''}`} /> <span>{applying ? 'Menerapkan...' : 'Terapkan Langsung'}</span></>}
        </button>
      </div>

      <p className="text-[10px] text-purple-900 font-medium">{proposal.summary}</p>

      <div className="flex flex-col gap-1.5 mt-1">
        {proposal.targets.map((tgt, idx) => (
          <div key={idx} className="p-2 bg-white border border-purple-200 rounded-lg flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9.5px] font-mono font-bold text-zinc-800">
              <span className="flex items-center gap-1 text-indigo-700">
                <FileCode className="w-3 h-3 text-indigo-500" /> {tgt.filePath}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedDiffTarget(tgt)}
                  className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[9px] font-bold cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> <span>Diff</span>
                </button>
                <span className="uppercase px-1 bg-zinc-100 rounded text-zinc-600">{tgt.action}</span>
              </div>
            </div>
            <p className="text-[9.5px] text-zinc-600">{tgt.description}</p>
          </div>
        ))}
      </div>

      {selectedDiffTarget && (
        <AutoDevDiffViewerModal target={selectedDiffTarget} onClose={() => setSelectedDiffTarget(null)} />
      )}
    </div>
  );
}
