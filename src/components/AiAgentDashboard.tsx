import React, { useState } from 'react';
import { useVisualizer } from '../modules/repoVisualizer';
import { usePreFlight } from '../modules/prPreFlight';
import { Network, CheckCircle2, AlertOctagon, Terminal, Database, Trash2 } from 'lucide-react';
import { VisualizerModal } from '../modules/repoVisualizer';
import { PreFlightModal } from '../modules/prPreFlight';
import { localCacheManager } from '../shared/utils/localCache';
import { DashboardGrid } from './DashboardGrid';
import { OfflineSyncPanel } from './OfflineSyncPanel';
import { RepoRecommendationWidget } from '../modules/repoRecommendation';
import { AiRefactorModal, generateRefactorProposal } from '../modules/repo';
import { LargeScaleSuiteWidget } from './LargeScaleSuiteWidget';

interface AiAgentDashboardProps {
  repoFullName: string;
}

export function AiAgentDashboard({ repoFullName }: AiAgentDashboardProps) {
  const { state: visState } = useVisualizer();
  const { state: pfState, triggerAudit, isRunning } = usePreFlight();
  
  const [activeModal, setActiveModal] = useState<'vis' | 'pf' | 'refactor' | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    localCacheManager.clearAll();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  const getStatusIcon = () => {
    if (pfState.status === 'passed') return <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />;
    if (pfState.status === 'failed') return <AlertOctagon className="w-4 h-4 text-rose-500 animate-bounce" />;
    return <Terminal className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <Network className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900 leading-none">AI Agent Dev-Center</h3>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Integrasi visualisasi & kendali gerbang pre-flight komit repositori</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full text-[9px] font-bold text-zinc-600">
            <Database className="w-3 h-3 text-indigo-500" />
            <span>{cacheCleared ? 'Cleared!' : 'Cache Ready'}</span>
          </div>
          <button
            onClick={handleClearCache}
            title="Hapus Cache Lokal"
            className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full text-[10px] font-semibold text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Agent Online</span>
          </div>
        </div>
      </div>

      {/* Large-Scale Project Suite with AUTO DEV Sakti Button */}
      <LargeScaleSuiteWidget />

      {/* AI Repo Recommendation & Quick Actions */}
      <RepoRecommendationWidget repoFullName={repoFullName} />

      {/* Grid Bento Cards */}
      <DashboardGrid
        repoFullName={repoFullName}
        visNodesLength={visState.nodes.length}
        pfScore={pfState.score}
        pfStatus={pfState.status}
        isRunning={isRunning}
        getStatusIcon={getStatusIcon}
        onOpenVis={() => setActiveModal('vis')}
        onOpenPf={() => setActiveModal('pf')}
        onTriggerRefactor={() => setActiveModal('refactor')}
        onTriggerAudit={triggerAudit}
      />

      {/* Sync and Offline Queue panel */}
      <OfflineSyncPanel repoFullName={repoFullName} />

      {/* Active Modals */}
      {activeModal === 'vis' && <VisualizerModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'pf' && <PreFlightModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'refactor' && (
        <AiRefactorModal
          proposal={generateRefactorProposal(repoFullName)}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
