import React from 'react';
import { RotateCw, Wand2, FileText, Sparkles } from 'lucide-react';

interface CommitHistoryHeaderActionsProps {
  loading: boolean;
  hasCommits: boolean;
  onRefresh: () => void;
  onOpenRangeSummary: () => void;
  onTriggerRefactor: () => void;
}

export function CommitHistoryHeaderActions({
  loading,
  hasCommits,
  onRefresh,
  onOpenRangeSummary,
  onTriggerRefactor,
}: CommitHistoryHeaderActionsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Button: Ringkas Rentang Commit dengan Gemini */}
      <button
        type="button"
        onClick={onOpenRangeSummary}
        disabled={!hasCommits || loading}
        className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
        title="Ringkas perubahan dalam rentang commit dengan Gemini AI"
      >
        <Sparkles className="w-3 h-3 text-indigo-600" />
        <span>Ringkas Rentang (AI)</span>
      </button>

      {/* Button: AI Refactor */}
      <button
        type="button"
        onClick={onTriggerRefactor}
        className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
        title="Cetuskan AI Refactor berbasis memori agent"
      >
        <Wand2 className="w-3 h-3 text-purple-600" />
        <span>AI Refactor</span>
      </button>

      {/* Button: Segarkan */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
      >
        <RotateCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        <span>Segarkan</span>
      </button>
    </div>
  );
}
