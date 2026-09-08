import React from 'react';
import { usePreFlight } from '../logic/usePreFlight';
import { PreFlightHeader } from './PreFlightHeader';
import { PreFlightCommitBar } from './PreFlightCommitBar';
import { PreFlightScoreBanner } from './PreFlightScoreBanner';
import { PreFlightFilesList } from './PreFlightFilesList';
import { PreFlightTabs } from './PreFlightTabs';
import { PreFlightIssueItem } from './PreFlightIssueItem';
import { CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

interface PreFlightModalProps {
  onClose: () => void;
}

export function PreFlightModal({ onClose }: PreFlightModalProps) {
  const {
    state,
    isRunning,
    fixingIssueId,
    isFixingAll,
    errorMessage,
    successMessage,
    activeTab,
    setActiveTab,
    filteredIssues,
    triggerAudit,
    applyFix,
    applyFixAll,
    reset,
  } = usePreFlight();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-2.5 max-h-[90vh] overflow-hidden text-xs">
        <PreFlightHeader onClose={onClose} model={state.model} />

        <PreFlightCommitBar commitMessage={state.commitMessage} commitHash={state.commitHash} />

        <PreFlightScoreBanner
          state={state}
          isRunning={isRunning}
          isFixingAll={isFixingAll}
          onTriggerAudit={triggerAudit}
          onFixAll={applyFixAll}
          onReset={reset}
        />

        {errorMessage && (
          <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-1.5 text-[10px]">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-1.5 text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <PreFlightFilesList files={state.filesReviewed} />

        <PreFlightTabs activeTab={activeTab} issues={state.issues} onSelectTab={setActiveTab} />

        <div className="flex-1 overflow-y-auto min-h-[160px] flex flex-col gap-2 pr-1">
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <p className="font-bold text-zinc-700 text-xs">Bersih dari Masalah & Celah!</p>
              <p className="text-[10px]">Semua berkas memenuhi standar peer-review keamanan & arsitektur.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <PreFlightIssueItem
                key={issue.id}
                issue={issue}
                isFixing={fixingIssueId === issue.id}
                onApplyFix={applyFix}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
