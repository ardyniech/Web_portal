import React, { useEffect } from 'react';
import { CommitItem } from '../storage/commitApi';
import { useCommitRangeSummary } from '../logic/useCommitRangeSummary';
import { CommitRangeSelector } from './CommitRangeSelector';
import { CommitSummaryResultView } from './CommitSummaryResultView';
import { Sparkles, X, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface ModalProps { repoFullName: string; commits: CommitItem[]; onClose: () => void; }

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs"><FileText className="w-4 h-4" /></div>
      <div>
        <h3 className="text-xs font-bold text-zinc-900 leading-none">AI Commit Range Summary</h3>
        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Ringkasan perubahan bertenaga Gemini AI</p>
      </div>
    </div>
    <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
  </div>
);

export function CommitRangeSummaryModal({ repoFullName, commits, onClose }: ModalProps) {
  const hooks = useCommitRangeSummary(repoFullName, commits);

  useEffect(() => {
    try {
      if (commits.length > 0 && !hooks.summary && !hooks.isGenerating) hooks.generateSummary();
    } catch (err) {
      console.error('[Module:CommitRangeSummaryModal] Error in useEffect:', err);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        <ModalHeader onClose={onClose} />
        <CommitRangeSelector commits={commits} headIndex={hooks.headIndex} baseIndex={hooks.baseIndex} selectedCount={hooks.selectedCommits.length} onHeadChange={hooks.setHeadIndex} onBaseChange={hooks.setBaseIndex} />
        
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] text-zinc-500">Model: <strong className="text-indigo-700 font-mono">Gemini 3.8 Flash</strong></span>
          <Button size="sm" onClick={hooks.generateSummary} disabled={hooks.isGenerating || hooks.selectedCommits.length === 0} icon={hooks.isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}>
            {hooks.isGenerating ? 'Menganalisis...' : 'Perbarui Ringkasan AI'}
          </Button>
        </div>

        {hooks.error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {hooks.error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[50vh]">
          {hooks.isGenerating ? (
            <div className="h-48 flex flex-col items-center justify-center text-zinc-400"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
          ) : hooks.summary ? (
            <CommitSummaryResultView summary={hooks.summary} copied={hooks.copied} onCopy={hooks.copyMarkdown} />
          ) : <div className="h-48 flex items-center justify-center text-zinc-400">Pilih rentang commit untuk memulai.</div>}
        </div>

        <div className="flex items-center justify-end border-t border-zinc-100 pt-2.5">
          <Button variant="ghost" size="sm" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
}