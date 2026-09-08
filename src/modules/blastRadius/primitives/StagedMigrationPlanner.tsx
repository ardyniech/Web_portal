import React from 'react';
import { BlastRadiusResult } from '../logic/types';
import { GitMerge, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface StagedMigrationPlannerProps {
  result: BlastRadiusResult;
}

export function StagedMigrationPlanner({ result }: StagedMigrationPlannerProps) {
  return (
    <div className="flex flex-col gap-2.5 p-3 bg-amber-50/40 border border-amber-200 rounded-xl">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
          <GitMerge className="w-3.5 h-3.5 text-amber-700" />
          <span>Staged Multi-Step Migration Plan (Pencegahan Cascading Error)</span>
        </h4>
        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded">
          {result.suggestStagedMigration ? 'Direkomendasikan' : 'Opsional'}
        </span>
      </div>

      {result.potentialBreakingChanges.length > 0 && (
        <div className="flex flex-col gap-1 p-2 bg-rose-50 border border-rose-200 rounded-lg">
          <span className="text-[9.5px] font-bold text-rose-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Potensi Breaking Changes Terdeteksi:
          </span>
          {result.potentialBreakingChanges.map((bc, idx) => (
            <p key={idx} className="text-[9.5px] text-rose-900 font-mono">
              • {bc}
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Tahapan Eksekusi Bertahap:</span>
        {(result.stagedSteps || [
          `Fase 1: Siapkan interface backward-compatible di ${result.targetFile}`,
          `Fase 2: Migrasikan ${result.totalAffectedModules} modul konsumen bertahap`,
          `Fase 3: Verifikasi build & linter tsc`,
          `Fase 4: Pembersihan kode legacy`,
        ]).map((step, idx) => (
          <div key={idx} className="flex items-start gap-2 p-1.5 bg-white border border-amber-100 rounded-lg text-[10px] text-zinc-800 font-medium">
            <span className="w-4 h-4 bg-amber-100 text-amber-800 font-bold rounded-full flex items-center justify-center text-[9px] shrink-0">
              {idx + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
