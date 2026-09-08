import React from 'react';
import { PreFlightState } from '../logic/types';
import { Play, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Wrench, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface PreFlightScoreBannerProps {
  state: PreFlightState;
  isRunning: boolean;
  isFixingAll: boolean;
  onTriggerAudit: () => void;
  onFixAll: () => void;
  onReset: () => void;
}

export function PreFlightScoreBanner({
  state,
  isRunning,
  isFixingAll,
  onTriggerAudit,
  onFixAll,
  onReset,
}: PreFlightScoreBannerProps) {
  const isPassed = state.status === 'passed';
  const hasIssues = state.issues.length > 0;

  const bannerBg = isRunning
    ? 'bg-amber-50 border-amber-200 text-amber-900'
    : isPassed
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
    : state.status === 'failed'
    ? 'bg-rose-50 border-rose-200 text-rose-900'
    : 'bg-zinc-50 border-zinc-200 text-zinc-800';

  return (
    <div className={`p-2.5 rounded-xl border ${bannerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}>
      <div className="flex items-start gap-2 min-w-0">
        {isRunning ? (
          <Loader2 className="w-4 h-4 shrink-0 text-amber-600 animate-spin mt-0.5" />
        ) : isPassed ? (
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-[11px] leading-tight">
              {isRunning
                ? 'Sedang Memindai & Mengaudit...'
                : isPassed
                ? 'Pre-Flight Lolos (Safe for Push)'
                : 'Celah & Pelanggaran Terdeteksi'}
            </h4>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${state.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              Skor: {state.score}/100
            </span>
          </div>
          <p className="text-[10px] opacity-90 mt-0.5 line-clamp-2">
            {state.summary || 'Audit berkas untuk memeriksa kesiapan rilis.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <Button
          size="sm"
          onClick={onTriggerAudit}
          disabled={isRunning || isFixingAll}
          icon={isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 text-rose-600" />}
          className="h-6 text-[9.5px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200"
        >
          {isRunning ? 'Audit...' : 'Mulai Audit'}
        </Button>

        {hasIssues && (
          <Button
            size="sm"
            onClick={onFixAll}
            disabled={isRunning || isFixingAll}
            icon={isFixingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3 text-emerald-600" />}
            className="h-6 text-[9.5px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
          >
            {isFixingAll ? 'Memperbaiki...' : 'Fix Semua'}
          </Button>
        )}

        <button
          onClick={onReset}
          disabled={isRunning || isFixingAll}
          className="p-1 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors"
          title="Reset Hasil"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
