import React from 'react';
import { useBlastRadius } from '../logic/useBlastRadius';
import { BlastRadiusOverview } from './BlastRadiusOverview';
import { StagedMigrationPlanner } from './StagedMigrationPlanner';
import { AlertOctagon, X, Layers, RefreshCw } from 'lucide-react';

interface BlastRadiusModalProps {
  onClose: () => void;
}

export function BlastRadiusModal({ onClose }: BlastRadiusModalProps) {
  const { results, selectedResult, setSelectedResult, loading, refresh } = useBlastRadius();
  const [tab, setTab] = React.useState<'overview' | 'staged'>('overview');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">Blast-Radius & Impact Analyzer</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Kalkulator dampak perubahan kode & Breaking Change Detector untuk proyek skala besar
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setTab('overview')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10.5px] cursor-pointer ${
              tab === 'overview' ? 'bg-white text-rose-800 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Overview & Dampak Modul
          </button>
          <button
            onClick={() => setTab('staged')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10.5px] cursor-pointer ${
              tab === 'staged' ? 'bg-white text-rose-800 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Staged Migration & Breaking Changes
          </button>
        </div>

        {selectedResult && (
          tab === 'overview' ? (
            <>
              <BlastRadiusOverview result={selectedResult} />
              <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 min-h-[160px] pr-1 max-h-[220px]">
                <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Modul Terdampak ({selectedResult.affectedModules.length})
                </h4>
                {selectedResult.affectedModules.map((mod, idx) => (
                  <div key={idx} className="p-2 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-800 text-[11px] block truncate">{mod.moduleName}</span>
                      <p className="text-[9.5px] text-zinc-500 mt-0.5">{mod.impactReason}</p>
                    </div>
                    <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded border shrink-0 ${
                      mod.riskLevel === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {mod.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[360px] pr-1">
              <StagedMigrationPlanner result={selectedResult} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
