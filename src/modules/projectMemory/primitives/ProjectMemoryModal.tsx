import React from 'react';
import { useProjectMemory } from '../logic/useProjectMemory';
import { BookMarked, X, ShieldCheck, Database, FileText } from 'lucide-react';

interface ProjectMemoryModalProps {
  onClose: () => void;
}

export function ProjectMemoryModal({ onClose }: ProjectMemoryModalProps) {
  const { data, loading } = useProjectMemory();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">Hierarchical Project Memory & Context Index</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Indeks Architectural Decision Records (ADR) dan konvensi SOP untuk injeksi token hemat & presisi
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 bg-purple-50/50 p-2.5 rounded-xl border border-purple-200">
          <div>
            <span className="text-[10px] text-zinc-500">Estimasi Penghematan Token:</span>
            <strong className="block text-purple-700 text-sm font-bold">~{data?.estimatedTokensSaved || 0} Tokens / Request</strong>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500">Aturan Arsitektur Terindeks:</span>
            <strong className="block text-zinc-800 text-sm font-bold">{data?.totalRules || 0} Aturan & ADR</strong>
          </div>
        </div>

        {/* ADR List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[180px] pr-1">
          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Architectural Decision Records (ADRs)
          </h4>

          {data?.adrs.map((adr) => (
            <div key={adr.id} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800 text-[11px]">{adr.id}: {adr.title}</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                  {adr.status}
                </span>
              </div>
              <p className="text-[10px] text-zinc-600">{adr.decision}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
