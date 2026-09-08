import React from 'react';
import { useBoundaryEnforcer } from '../logic/useBoundaryEnforcer';
import { ComplexityMonitorView } from './ComplexityMonitorView';
import { ShieldCheck, X, RefreshCw, AlertTriangle, CheckCircle, BarChart3, Shield } from 'lucide-react';

interface BoundaryEnforcerModalProps {
  onClose: () => void;
}

export function BoundaryEnforcerModal({ onClose }: BoundaryEnforcerModalProps) {
  const { report, complexityReport, activeTab, setActiveTab, loading, refresh } = useBoundaryEnforcer();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">Living Architectural Boundary Enforcer</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Validasi isolasi modular, pencegahan impor privat, & pemantau densitas &lt;125 baris / cyclomatic complexity
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('boundaries')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10.5px] cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'boundaries' ? 'bg-white text-blue-800 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Cellular Boundary Validator</span>
          </button>
          <button
            onClick={() => setActiveTab('complexity')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10.5px] cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'complexity' ? 'bg-white text-blue-800 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>File Density & Complexity Monitor</span>
          </button>
        </div>

        {activeTab === 'boundaries' ? (
          <>
            <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              <div>
                <span className="text-[10px] text-zinc-500">Berkas Terperiksa:</span>
                <strong className="block text-zinc-800 text-sm font-bold">{report?.totalFilesAudited || 0} Berkas</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500">Modul Bersih (Clean):</span>
                <strong className="block text-emerald-600 text-sm font-bold">{report?.cleanModulesCount || 0} Modul</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500">Pelanggaran Batas:</span>
                <strong className={`block text-sm font-bold ${report && report.violationsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {report?.violationsCount || 0} Pelanggaran
                </strong>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[180px] pr-1 max-h-[300px]">
              {report?.violations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <p className="font-bold text-zinc-700 text-xs">Arsitektur Seluler 100% Bersih!</p>
                  <p className="text-[10px]">Tidak ada impor ilegal atau pelanggaran isolasi antar modul.</p>
                </div>
              ) : (
                report?.violations.map((v) => (
                  <div key={v.id} className="p-2.5 bg-rose-50/50 border border-rose-200 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-[11px]">{v.ruleType}</span>
                      <span className="text-[9px] font-mono text-zinc-500">Baris {v.line}</span>
                    </div>
                    <p className="text-[10px] text-zinc-700">{v.message}</p>
                    <span className="text-[9px] font-mono text-zinc-400 truncate">Berkas: {v.sourceFile}</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <ComplexityMonitorView report={complexityReport} loading={loading} />
        )}
      </div>
    </div>
  );
}
