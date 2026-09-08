import React from 'react';
import { useModelSwitcher } from '../logic/useModelSwitcher';
import { Cpu, X, CheckCircle2, AlertTriangle, RefreshCw, Zap, ShieldAlert, ArrowRight } from 'lucide-react';

interface ModelSwitcherModalProps {
  onClose: () => void;
}

export function ModelSwitcherModal({ onClose }: ModelSwitcherModalProps) {
  const { models, switchLogs, loading, switchModel, refreshStatus } = useModelSwitcher();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-100 text-cyan-800 rounded-lg">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">Auto AI Model Switching & Quota Resilience</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Peralihan otomatis ke model sehat saat terindikasi batas kuota (429/503/Quota Limit)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refreshStatus()} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer" title="Refresh Status">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model Pool Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {models.map((m) => {
            const isQuotaExhausted = m.status === 'quota_exhausted';
            return (
              <div
                key={m.modelName}
                className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                  m.isPrimary
                    ? 'bg-cyan-50/70 border-cyan-300 ring-2 ring-cyan-400/30'
                    : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-zinc-900 flex items-center gap-1.5">
                    <Zap className={`w-3.5 h-3.5 ${m.isPrimary ? 'text-cyan-600' : 'text-zinc-400'}`} />
                    {m.displayName}
                  </span>
                  {m.isPrimary && (
                    <span className="px-1.5 py-0.2 bg-cyan-600 text-white font-extrabold text-[8.5px] rounded uppercase">
                      UTAMA
                    </span>
                  )}
                </div>

                <div className="text-[9.5px] font-mono text-zinc-500 flex items-center justify-between">
                  <span>Reqs: {m.requestsTotal}</span>
                  <span className={m.failuresTotal > 0 ? 'text-rose-600 font-bold' : 'text-zinc-400'}>
                    Failures: {m.failuresTotal}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200/60 pt-2 mt-0.5">
                  <span className="text-[9.5px] font-bold flex items-center gap-1">
                    {isQuotaExhausted ? (
                      <span className="text-rose-600 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Quota Limit</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>
                    )}
                  </span>
                  {!m.isPrimary && (
                    <button
                      onClick={() => switchModel(m.modelName)}
                      disabled={loading}
                      className="px-2 py-0.5 text-[9.5px] font-bold bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300 rounded cursor-pointer"
                    >
                      Pilih Model
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Switch Logs */}
        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[200px] border-t border-zinc-100 pt-2">
          <h4 className="text-[10.5px] font-bold text-zinc-800 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-cyan-600" /> Log Peralihan Otomatis Akibat Quota Limit
          </h4>
          {switchLogs.length === 0 ? (
            <p className="text-[10px] text-zinc-400 italic p-2 bg-zinc-50 rounded-lg">
              Belum ada pemicu peralihan otomatis. Semua model dalam batas kuota aman.
            </p>
          ) : (
            switchLogs.map((log) => (
              <div key={log.id} className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-0.5 text-[9.5px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 flex items-center gap-1">
                    {log.fromModel} <ArrowRight className="w-3 h-3 text-cyan-600" /> {log.toModel}
                  </span>
                  <span className="text-zinc-400 font-mono text-[8.5px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-zinc-600 font-medium">{log.triggerReason}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
