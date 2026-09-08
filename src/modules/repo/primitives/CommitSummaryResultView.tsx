import React from 'react';
import { CommitRangeSummary } from '../logic/commitSummaryTypes';
import { Sparkles, Copy, Check, ShieldAlert, Tag, FileText } from 'lucide-react';

interface CommitSummaryResultViewProps {
  summary: CommitRangeSummary;
  copied: boolean;
  onCopy: () => void;
}

export function CommitSummaryResultView({ summary, copied, onCopy }: CommitSummaryResultViewProps) {
  const getCategoryColor = (cat: string) => {
    if (/fitur|feat/i.test(cat)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (/fix|bug/i.test(cat)) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (/doc/i.test(cat)) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const getImpactBadge = (level: string) => {
    if (level === 'Tinggi') return 'bg-rose-100 text-rose-800 border-rose-300';
    if (level === 'Sedang') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Title & Actions */}
      <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            {summary.title}
          </h4>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getImpactBadge(summary.impactLevel)}`}>
              Dampak: {summary.impactLevel}
            </span>
            <button
              onClick={onCopy}
              className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-white hover:bg-indigo-100/70 border border-indigo-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-indigo-600" />}
              <span>{copied ? 'Tersalin' : 'Salin Markdown'}</span>
            </button>
          </div>
        </div>
        <p className="text-[11.5px] text-zinc-700 font-medium leading-relaxed">
          {summary.overview}
        </p>
      </div>

      {/* Key Changes */}
      {summary.keyChanges && summary.keyChanges.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-600" />
            Poin Perubahan Utama:
          </span>
          <div className="flex flex-col gap-1.5">
            {summary.keyChanges.map((change, idx) => (
              <div key={idx} className="p-2 bg-white border border-zinc-200 rounded-lg flex items-start gap-2 text-xs">
                <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getCategoryColor(change.category)}`}>
                  {change.category}
                </span>
                <span className="text-zinc-800 text-[11px] leading-snug">{change.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact & Release Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {summary.impactAnalysis && (
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              Analisis Dampak:
            </span>
            <p className="text-[10.5px] text-zinc-600 leading-normal">{summary.impactAnalysis}</p>
          </div>
        )}
        {summary.releaseNotes && (
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-600" />
              Catatan Rilis:
            </span>
            <p className="text-[10.5px] text-zinc-600 leading-normal whitespace-pre-line font-mono">{summary.releaseNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
