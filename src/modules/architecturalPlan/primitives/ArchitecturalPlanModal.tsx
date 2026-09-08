import React from 'react';
import { useArchitecturalPlan } from '../logic/useArchitecturalPlan';
import { Map, X, Compass, ShieldCheck, CheckCircle2, Clock, Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface ArchitecturalPlanModalProps {
  onClose: () => void;
}

export function ArchitecturalPlanModal({ onClose }: ArchitecturalPlanModalProps) {
  const { plan, taskGoal, setTaskGoal, loading, createPlan } = useArchitecturalPlan();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">AI Executive Architecture Planning Engine</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Perencanaan arsitektur terstruktur, pemeta fase eksekusi, & strategi mitigasi risiko skala besar
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input prompt */}
        <div className="flex items-center gap-2 bg-amber-50/60 p-2 border border-amber-200/80 rounded-xl">
          <input
            type="text"
            value={taskGoal}
            onChange={(e) => setTaskGoal(e.target.value)}
            placeholder="Tuliskan target fitur/refaktor skala besar..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none font-medium"
          />
          <Button size="sm" onClick={() => createPlan()} className="h-8 px-3 text-xs bg-amber-600 text-white font-bold cursor-pointer shrink-0">
            {loading ? 'Menyusun Plan...' : 'Buat Architectural Plan'}
          </Button>
        </div>

        {/* Content Plan */}
        {!plan ? (
          <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
            <Map className="w-6 h-6 text-amber-500" />
            <p className="font-bold text-zinc-700 text-xs">Arsitektur Terencana Bebas Kegagalan Scale-Up</p>
            <p className="text-[10px] text-center max-w-md">
              Ketik target pengembangan di atas lalu klik "Buat Architectural Plan" untuk menghasilkan blueprint eksekusi terstruktur.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 max-h-[360px]">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-950 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Executive Strategic Summary
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                  Risiko: {plan.overallRisk}
                </span>
              </div>
              <p className="text-[10px] text-amber-900 leading-relaxed">{plan.strategicSummary}</p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold px-1">
              <span>{plan.phases.length} Fase Eksekusi Bertahap</span>
              <span className="flex items-center gap-2 font-mono text-amber-800">
                <Clock className="w-3 h-3" /> Est. {plan.estimatedTotalMinutes} Mins | <Zap className="w-3 h-3 text-amber-600" /> ~{plan.totalEstimatedTokens} Tokens
              </span>
            </div>

            {plan.phases.map((phs) => (
              <div key={phs.phaseId} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-[11px]">
                    Fase {phs.phaseId}: {phs.title}
                  </span>
                  <span className="text-[8.5px] font-bold uppercase px-1.5 py-0.2 bg-zinc-200 text-zinc-800 rounded">
                    Risk: {phs.riskLevel}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600 font-medium">{phs.objective}</p>
                <div className="text-[9.5px] text-zinc-500 font-mono">
                  Berkas Target: {phs.targetFiles.map((f) => `${f.filePath} (${f.action})`).join(', ')}
                </div>
                <div className="text-[9px] text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Kriteria Validasi: {phs.validationCriteria.join('; ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
