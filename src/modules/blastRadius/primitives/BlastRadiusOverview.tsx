import React from 'react';
import { BlastRadiusResult } from '../logic/types';
import { AlertOctagon, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

interface BlastRadiusOverviewProps {
  result: BlastRadiusResult;
}

export function BlastRadiusOverview({ result }: BlastRadiusOverviewProps) {
  const riskColor = {
    low: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    medium: 'bg-amber-50 border-amber-200 text-amber-900',
    high: 'bg-orange-50 border-orange-200 text-orange-900',
    critical: 'bg-rose-50 border-rose-200 text-rose-900',
  }[result.overallRisk];

  return (
    <div className={`p-3 rounded-xl border ${riskColor} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-bold text-xs truncate">Target: {result.targetFile}</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/80 border border-current">
          Skor Dampak: {result.blastScore}/100
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/60 p-2 rounded-lg border border-current/20">
        <div>
          <span className="text-zinc-500">Tingkat Risiko:</span>
          <strong className="block font-bold uppercase">{result.overallRisk}</strong>
        </div>
        <div>
          <span className="text-zinc-500">Modul Terdampak:</span>
          <strong className="block font-bold">{result.totalAffectedModules} Modul</strong>
        </div>
      </div>

      {result.suggestStagedMigration && (
        <div className="text-[9.5px] p-2 bg-amber-100/70 border border-amber-300 text-amber-900 rounded-lg flex items-center gap-1.5 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span>Direkomendasikan melakukan staged migration bertahap untuk mencegah cascading failure.</span>
        </div>
      )}
    </div>
  );
}
