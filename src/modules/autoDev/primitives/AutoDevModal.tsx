import React from 'react';
import { useAutoDev } from '../logic/useAutoDev';
import { Sparkles, X, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface AutoDevModalProps {
  onClose: () => void;
}

export function AutoDevModal({ onClose }: AutoDevModalProps) {
  const { currentRun, loading, taskGoal, setTaskGoal, error, runPipeline } = useAutoDev();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">Tombol Sakti Auto Dev (7-Stage Master Orchestrator)</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Integrasi Penuh: Memory → AST Graph → Impact → Planning Engine → Model Switcher → Sandbox → Boundary (&lt;125 baris)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input & Execution Launch */}
        <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-amber-50/80 border border-indigo-200/80 rounded-xl">
          <input
            type="text"
            value={taskGoal}
            onChange={(e) => setTaskGoal(e.target.value)}
            placeholder="Ketik target otomatisasi skala besar (cth: Refaktor Auth Token Provider & Scale Up Architecture)..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-xl focus:outline-none font-medium"
          />
          <Button
            size="sm"
            onClick={() => runPipeline()}
            className="h-8 px-4 text-xs bg-gradient-to-r from-amber-400 via-purple-600 to-indigo-600 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Orchestrating...' : 'JALANKAN AUTO DEV SAKTI'}</span>
          </Button>
        </div>

        {/* Stages Output */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[220px] max-h-[360px] pr-1">
          {error && <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-bold">{error}</div>}
          {!currentRun ? (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
              <Cpu className="w-6 h-6 text-indigo-500" />
              <p className="font-bold text-zinc-700 text-xs">Unified 7-Stage Autonomous Master Engine</p>
              <p className="text-[10px] text-center max-w-md">
                Klik "JALANKAN AUTO DEV SAKTI" untuk memicu integrasi 7 instrumen arsitektur, perencanaan AI terstruktur, & failover model otomatis secara sekaligus.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 bg-indigo-50 text-indigo-900 rounded-xl border border-indigo-200 text-[10.5px]">
                <span className="font-bold font-mono">Run ID: {currentRun.runId}</span>
                <span className="font-bold bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded text-[9.5px]">
                  Hemat ~{currentRun.tokensSavedEstimate} Tokens Context
                </span>
              </div>

              {currentRun.stages.map((stg) => (
                <div key={stg.stageId} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      Stage {stg.stageId}: {stg.stageName}
                    </span>
                    <span className="font-mono text-zinc-400 text-[9px]">{stg.durationMs}ms</span>
                  </div>
                  <p className="text-zinc-600 font-medium pl-5">{stg.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
