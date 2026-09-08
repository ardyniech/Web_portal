import React from 'react';
import { IsolatedSuiteResult } from '../logic/types';
import { PlayCircle, CheckCircle2, XCircle, Timer, ShieldCheck } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface TargetedTestRunnerViewProps {
  testResult: IsolatedSuiteResult | null;
  loading: boolean;
  onRunTests: () => void;
}

export function TargetedTestRunnerView({ testResult, loading, onRunTests }: TargetedTestRunnerViewProps) {
  return (
    <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
      <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
        <div>
          <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pre-Commit Isolated Test Suite (Targeted Runner)</span>
          </span>
          <p className="text-[10px] text-emerald-700 mt-0.5">
            Eksekusi pengujian cepat khusus hanya untuk modul yang mengalami modifikasi (zero slow full-suite run).
          </p>
        </div>
        <Button size="sm" onClick={onRunTests} className="h-8 px-3 text-xs bg-emerald-600 text-white font-bold">
          {loading ? 'Menguji...' : 'Jalankan Targeted Test'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 max-h-[340px]">
        {!testResult ? (
          <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
            <PlayCircle className="w-6 h-6 text-emerald-400" />
            <p className="text-xs font-semibold text-zinc-600">Targeted Module Regression Test</p>
            <p className="text-[10px] text-zinc-400 text-center">
              Klik "Jalankan Targeted Test" untuk menguji modul terdampak secara terisolasi tanpa overhead.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-600 font-bold px-1">
              <span>{testResult.passedCount} dari {testResult.totalExecuted} modul LULUS</span>
              <span className="flex items-center gap-1 text-emerald-700 font-mono">
                <Timer className="w-3 h-3" /> Total Durasi: {testResult.durationTotalMs}ms
              </span>
            </div>

            {testResult.results.map((r, idx) => (
              <div key={idx} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {r.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-900 text-[11px] block">{r.moduleName}</span>
                    <p className="text-[9.5px] text-zinc-500 truncate">{r.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-mono text-zinc-400">{r.durationMs}ms</span>
                  <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                    {r.assertionsPassed} Assertions
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
