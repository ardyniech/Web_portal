import React from 'react';
import { CommitItem } from '../storage/commitApi';
import { GitCommit, ArrowRight, Layers } from 'lucide-react';

interface CommitRangeSelectorProps {
  commits: CommitItem[];
  headIndex: number;
  baseIndex: number;
  selectedCount: number;
  onHeadChange: (index: number) => void;
  onBaseChange: (index: number) => void;
}

export function CommitRangeSelector({
  commits,
  headIndex,
  baseIndex,
  selectedCount,
  onHeadChange,
  onBaseChange,
}: CommitRangeSelectorProps) {
  return (
    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-zinc-800 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          Pilih Rentang Commit:
        </span>
        <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
          {selectedCount} Commit Dipilih
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Base Commit (Awal / Lebih Lama) */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1">
            <span>Dari Commit (Base):</span>
          </label>
          <select
            value={baseIndex}
            onChange={(e) => onBaseChange(Number(e.target.value))}
            className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 font-mono focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            {commits.map((c, i) => (
              <option key={c.sha || i} value={i}>
                [{c.sha.slice(0, 7)}] {(c.commit.message || '').split('\n')[0].slice(0, 30)}
              </option>
            ))}
          </select>
        </div>

        {/* Head Commit (Akhir / Terbaru) */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-zinc-400" />
            <span>Sampai Commit (Head):</span>
          </label>
          <select
            value={headIndex}
            onChange={(e) => onHeadChange(Number(e.target.value))}
            className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 font-mono focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            {commits.map((c, i) => (
              <option key={c.sha || i} value={i}>
                [{c.sha.slice(0, 7)}] {(c.commit.message || '').split('\n')[0].slice(0, 30)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
