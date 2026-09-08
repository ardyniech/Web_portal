import React, { useState } from 'react';
import { Network, AlertOctagon, BookMarked, Layers, ShieldCheck, Sparkles, Compass } from 'lucide-react';
import { CodeGraphModal } from '../modules/codeGraph';
import { BlastRadiusModal } from '../modules/blastRadius';
import { ProjectMemoryModal } from '../modules/projectMemory';
import { AtomicStagingModal } from '../modules/atomicStaging';
import { BoundaryEnforcerModal } from '../modules/boundaryEnforcer';
import { AutoDevModal } from '../modules/autoDev';
import { ArchitecturalPlanModal } from '../modules/architecturalPlan';
import { Button } from '../shared/atoms/Button';

export function LargeScaleSuiteWidget() {
  const [activeModal, setActiveModal] = useState<'graph' | 'blast' | 'memory' | 'staging' | 'boundary' | 'autodev' | 'plan' | null>(null);

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-indigo-950 to-purple-950 p-3 rounded-xl border border-indigo-900/60 text-white flex flex-col gap-2.5 shadow-lg">
      <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-400 text-zinc-950 rounded-lg shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold tracking-wide uppercase text-amber-300">
              Large-Scale Project Suite & Planning Engine
            </h4>
            <p className="text-[9.5px] text-indigo-200">
              Perencanaan arsitektur terstruktur, otomasi 5-stage, & tombol sakti Auto Dev
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={() => setActiveModal('plan')}
            className="h-7 px-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] rounded-lg border border-amber-400/40 cursor-pointer flex items-center gap-1"
          >
            <Compass className="w-3 h-3 text-amber-300" />
            <span>AI Planning Engine</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveModal('autodev')}
            className="h-7 px-3 bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 hover:brightness-110 text-zinc-950 font-black text-[10.5px] rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all border border-amber-300/50"
          >
            <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
            <span>TOMBOL SAKTI AUTO DEV</span>
          </Button>
        </div>
      </div>

      {/* 5 Tool Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        <button
          onClick={() => setActiveModal('graph')}
          className="p-2 bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-700/50 rounded-lg flex flex-col gap-1 text-left transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-indigo-200 group-hover:text-white flex items-center gap-1">
            <Network className="w-3 h-3 text-indigo-400 shrink-0" /> Code Graph & LSP
          </span>
          <span className="text-[8.5px] text-indigo-300/80 font-mono">AST & References</span>
        </button>

        <button
          onClick={() => setActiveModal('blast')}
          className="p-2 bg-rose-900/30 hover:bg-rose-800/50 border border-rose-700/40 rounded-lg flex flex-col gap-1 text-left transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-rose-200 group-hover:text-white flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" /> Impact & Blast Radius
          </span>
          <span className="text-[8.5px] text-rose-300/80 font-mono">Breaking Changes</span>
        </button>

        <button
          onClick={() => setActiveModal('memory')}
          className="p-2 bg-purple-900/30 hover:bg-purple-800/50 border border-purple-700/40 rounded-lg flex flex-col gap-1 text-left transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-purple-200 group-hover:text-white flex items-center gap-1">
            <BookMarked className="w-3 h-3 text-purple-400 shrink-0" /> Project Memory
          </span>
          <span className="text-[8.5px] text-purple-300/80 font-mono">ADR & Hybrid Search</span>
        </button>

        <button
          onClick={() => setActiveModal('staging')}
          className="p-2 bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-700/40 rounded-lg flex flex-col gap-1 text-left transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-emerald-200 group-hover:text-white flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400 shrink-0" /> Atomic Sandbox
          </span>
          <span className="text-[8.5px] text-emerald-300/80 font-mono">Targeted Test Suite</span>
        </button>

        <button
          onClick={() => setActiveModal('boundary')}
          className="p-2 bg-blue-900/30 hover:bg-blue-800/50 border border-blue-700/40 rounded-lg flex flex-col gap-1 text-left transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-blue-200 group-hover:text-white flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" /> Boundary Enforcer
          </span>
          <span className="text-[8.5px] text-blue-300/80 font-mono">Complexity & Density</span>
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'plan' && <ArchitecturalPlanModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'autodev' && <AutoDevModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'graph' && <CodeGraphModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'blast' && <BlastRadiusModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'memory' && <ProjectMemoryModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'staging' && <AtomicStagingModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'boundary' && <BoundaryEnforcerModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}
