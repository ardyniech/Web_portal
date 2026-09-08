import React from 'react';
import { usePreFlight } from '../logic/usePreFlight';
import { X, ShieldAlert } from 'lucide-react';
import { StatusBanner } from './components/StatusBanner';
import { CommitOverview } from './components/CommitOverview';
import { FileGrid } from './components/FileGrid';
import { IssueList } from './components/IssueList';

interface PreFlightModalProps { onClose: () => void; }

export function PreFlightModal({ onClose }: PreFlightModalProps) {
  try {
    const auditState = usePreFlight();
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg"><ShieldAlert className="w-4 h-4" /></div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 leading-none">AI PR Pre-Flight Audit</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <CommitOverview state={auditState.state} />
          <StatusBanner {...auditState} />
          <FileGrid files={auditState.state.filesReviewed} />
          <IssueList issues={auditState.state.issues} onApplyFix={auditState.applyFix} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('[Module:PreFlightModal] Error in render:', error);
    return null;
  }
}