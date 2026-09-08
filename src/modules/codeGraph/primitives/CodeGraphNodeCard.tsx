import React from 'react';
import { DependencyNode } from '../logic/types';
import { Network, FileCode, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface CodeGraphNodeCardProps {
  node: DependencyNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function CodeGraphNodeCard({ node, isSelected, onSelect }: CodeGraphNodeCardProps) {
  const isCircular = node.circularWith && node.circularWith.length > 0;

  return (
    <div
      onClick={() => onSelect(node.id)}
      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
        isSelected
          ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
          : isCircular
          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
          : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-zinc-500'}`} />
          <span className="font-bold text-zinc-800 text-[11px] truncate">{node.name}</span>
        </div>
        <span className="text-[9px] font-mono text-zinc-400 bg-zinc-50 px-1 rounded border border-zinc-200 shrink-0">
          {node.lineCount} baris
        </span>
      </div>

      <div className="flex items-center gap-2 text-[9.5px] text-zinc-500">
        <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
          <ArrowUpRight className="w-3 h-3" /> {node.dependencies.length} Impor
        </span>
        <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
          <ArrowDownLeft className="w-3 h-3" /> {node.dependents.length} Dipakai
        </span>
      </div>

      {isCircular && (
        <div className="flex items-center gap-1 text-[9px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
          <span>Siklis dengan: {node.circularWith?.join(', ')}</span>
        </div>
      )}
    </div>
  );
}
