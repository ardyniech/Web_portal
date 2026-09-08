import React from 'react';
import { DependencyNode } from '../logic/types';
import { Layers, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';

interface CodeGraphDetailProps {
  node: DependencyNode | null;
}

export function CodeGraphDetail({ node }: CodeGraphDetailProps) {
  if (!node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
        <Layers className="w-6 h-6 text-zinc-300" />
        <p className="text-xs font-semibold text-zinc-600">Pilih Modul untuk Detail Dependensi</p>
        <p className="text-[10px] text-zinc-400 text-center">
          Klik salah satu modul di daftar sebelah kiri untuk menelusuri rantai impor & referensi dependensi.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl flex flex-col gap-3 overflow-y-auto">
      <div className="border-b border-zinc-200 pb-2">
        <span className="text-[9px] font-bold uppercase text-indigo-600">Modul Terpilih</span>
        <h4 className="font-bold text-sm text-zinc-900">{node.name}</h4>
        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{node.filePath}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <h5 className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
          <ArrowRight className="w-3 h-3 text-indigo-500" /> Mengimpor Modul Lain ({node.dependencies.length})
        </h5>
        {node.dependencies.length === 0 ? (
          <p className="text-[10px] text-zinc-400 italic">Modul ini berdiri sendiri (tidak mengimpor modul lain).</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {node.dependencies.map((dep, idx) => (
              <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                {dep}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <h5 className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
          <CornerDownRight className="w-3 h-3 text-emerald-500" /> Dikonsumsi Oleh ({node.dependents.length})
        </h5>
        {node.dependents.length === 0 ? (
          <p className="text-[10px] text-zinc-400 italic">Belum dikonsumsi langsung oleh modul lain.</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {node.dependents.map((dep, idx) => (
              <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                {dep}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
