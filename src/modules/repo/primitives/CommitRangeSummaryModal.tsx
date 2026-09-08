import React, { useEffect } from 'react';
import { CommitItem } from '../storage/commitApi';
import { useCommitRangeSummary } from '../logic/useCommitRangeSummary';
import { CommitRangeSelector } from './CommitRangeSelector';
import { CommitSummaryResultView } from './CommitSummaryResultView';
import { Sparkles, X, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface CommitRangeSummaryModalProps {
  repoFullName: string;
  commits: CommitItem[];
  onClose: () => void;
}

export function CommitRangeSummaryModal({
  repoFullName,
  commits,
  onClose,
}: CommitRangeSummaryModalProps) {
  const {
    headIndex,
    setHeadIndex,
    baseIndex,
    setBaseIndex,
    selectedCommits,
    summary,
    isGenerating,
    error,
    copied,
    generateSummary,
    copyMarkdown,
  } = useCommitRangeSummary(repoFullName, commits);

  useEffect(() => {
    if (commits.length > 0 && !summary && !isGenerating) {
      generateSummary();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">
                AI Commit Range Summary
              </h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Ringkasan perubahan komprehensif rentang commit bertenaga Gemini AI
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Range Selector & Actions */}
        <CommitRangeSelector
          commits={commits}
          headIndex={headIndex}
          baseIndex={baseIndex}
          selectedCount={selectedCommits.length}
          onHeadChange={setHeadIndex}
          onBaseChange={setBaseIndex}
        />

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] text-zinc-500">
            Model: <strong className="text-indigo-700 font-mono">Gemini 3.8 Flash</strong>
          </span>
          <Button
            size="sm"
            onClick={generateSummary}
            disabled={isGenerating || selectedCommits.length === 0}
            icon={isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 text-[11px] px-3.5 rounded-lg shadow-2xs"
          >
            {isGenerating ? 'Menganalisis Perubahan...' : 'Perbarui Ringkasan AI'}
          </Button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[50vh] pr-1">
          {isGenerating ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium text-zinc-600">
                Menghasilkan ringkasan human-readable dengan Gemini...
              </span>
            </div>
          ) : summary ? (
            <CommitSummaryResultView summary={summary} copied={copied} onCopy={copyMarkdown} />
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-400 text-xs">
              Pilih rentang commit dan klik "Perbarui Ringkasan AI".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-zinc-100 pt-2.5">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
