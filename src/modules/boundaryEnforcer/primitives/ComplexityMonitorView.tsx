import React from 'react';
import { ComplexityAuditReport } from '../logic/types';
import { FileText, AlertTriangle, CheckCircle, BarChart3, Split } from 'lucide-react';

interface ComplexityMonitorViewProps {
  report: ComplexityAuditReport | null;
  loading: boolean;
}

export function ComplexityMonitorView({ report, loading }: ComplexityMonitorViewProps) {
  if (!report) {
    return (
      <div className="p-8 text-center text-zinc-400 text-xs">
        {loading ? 'Memindai kompleksitas berkas...' : 'Tidak ada data kompleksitas.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
      <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
        <div>
          <span className="text-[10px] text-zinc-500">Mendekati Limit (100-125):</span>
          <strong className="block text-amber-700 text-xs font-bold">{report.filesApproachingLimit} Berkas</strong>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500">Monolitik Pelanggar (&gt;125):</span>
          <strong className="block text-emerald-700 text-xs font-bold">{report.criticalMonoliths} Berkas (0 Violations)</strong>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500">Rata-rata Kompleksitas:</span>
          <strong className="block text-indigo-700 text-xs font-bold">{report.averageComplexity} Cyclomatic Score</strong>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 max-h-[340px]">
        {report.files.slice(0, 30).map((file, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-[10px] ${
              file.densityStatus === 'critical'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : file.densityStatus === 'warning'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-zinc-50 border-zinc-200 text-zinc-800'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-bold">
                <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate font-mono">{file.filePath}</span>
              </div>
              {file.suggestedDecomposition && (
                <p className="text-[9px] text-amber-800 mt-0.5 flex items-center gap-1">
                  <Split className="w-2.5 h-2.5 shrink-0" /> {file.suggestedDecomposition}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-mono text-zinc-500 font-semibold">
                CC: {file.cyclomaticComplexity}
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                file.densityStatus === 'critical' ? 'bg-rose-200 text-rose-900' : file.densityStatus === 'warning' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {file.lineCount} Baris
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
