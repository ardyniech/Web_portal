import React, { useState } from 'react';
import { Network, AlertOctagon, BookMarked, Layers, ShieldCheck, Sparkles, Compass, Cpu } from 'lucide-react';
import { CodeGraphModal } from '../modules/codeGraph';
import { BlastRadiusModal } from '../modules/blastRadius';
import { ProjectMemoryModal } from '../modules/projectMemory';
import { AtomicStagingModal } from '../modules/atomicStaging';
import { BoundaryEnforcerModal } from '../modules/boundaryEnforcer';
import { AutoDevModal } from '../modules/autoDev';
import { ArchitecturalPlanModal } from '../modules/architecturalPlan';
import { ModelSwitcherModal } from '../modules/modelSwitcher';
import { Button } from '../shared/atoms/Button';

export function LargeScaleSuiteWidget() {
  const [modal, setModal] = useState<'graph' | 'blast' | 'memory' | 'staging' | 'boundary' | 'autodev' | 'plan' | 'models' | null>(null);

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-indigo-950 to-purple-950 p-3 rounded-xl border border-indigo-900/60 text-white flex flex-col gap-2.5 shadow-lg text-xs">
      <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-400 text-zinc-950 rounded-lg"><Sparkles className="w-3.5 h-3.5" /></div>
          <div>
            <h4 className="text-[11px] font-extrabold uppercase text-amber-300">Large-Scale Project Suite</h4>
            <p className="text-[9.5px] text-indigo-200">Perencanaan arsitektur, auto-switching model, & Tombol Sakti Auto Dev</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" onClick={() => setModal('models')} className="h-7 px-2.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-lg border border-cyan-400/40 cursor-pointer flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-300" /><span>Auto Model Switcher</span>
          </Button>
          <Button size="sm" onClick={() => setModal('plan')} className="h-7 px-2.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-lg border border-amber-400/40 cursor-pointer flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-300" /><span>AI Planning</span>
          </Button>
          <Button size="sm" onClick={() => setModal('autodev')} className="h-7 px-3 bg-gradient-to-r from-amber-400 to-purple-600 text-zinc-950 font-black text-[10.5px] rounded-lg cursor-pointer flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-zinc-950" /><span>TOMBOL SAKTI AUTO DEV</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        <button onClick={() => setModal('graph')} className="p-2 bg-indigo-900/40 border border-indigo-700/50 rounded-lg text-left cursor-pointer">
          <span className="text-[10px] font-bold text-indigo-200 flex items-center gap-1"><Network className="w-3 h-3 text-indigo-400" /> Code Graph</span>
          <span className="text-[8.5px] text-indigo-300/80 font-mono">AST & Symbols</span>
        </button>
        <button onClick={() => setModal('blast')} className="p-2 bg-rose-900/30 border border-rose-700/40 rounded-lg text-left cursor-pointer">
          <span className="text-[10px] font-bold text-rose-200 flex items-center gap-1"><AlertOctagon className="w-3 h-3 text-rose-400" /> Blast Radius</span>
          <span className="text-[8.5px] text-rose-300/80 font-mono">Breaking Changes</span>
        </button>
        <button onClick={() => setModal('memory')} className="p-2 bg-purple-900/30 border border-purple-700/40 rounded-lg text-left cursor-pointer">
          <span className="text-[10px] font-bold text-purple-200 flex items-center gap-1"><BookMarked className="w-3 h-3 text-purple-400" /> Memory</span>
          <span className="text-[8.5px] text-purple-300/80 font-mono">ADR Search</span>
        </button>
        <button onClick={() => setModal('staging')} className="p-2 bg-emerald-900/30 border border-emerald-700/40 rounded-lg text-left cursor-pointer">
          <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-1"><Layers className="w-3 h-3 text-emerald-400" /> Sandbox</span>
          <span className="text-[8.5px] text-emerald-300/80 font-mono">Targeted Tests</span>
        </button>
        <button onClick={() => setModal('boundary')} className="p-2 bg-blue-900/30 border border-blue-700/40 rounded-lg text-left cursor-pointer">
          <span className="text-[10px] font-bold text-blue-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-400" /> Boundary</span>
          <span className="text-[8.5px] text-blue-300/80 font-mono">Density Check</span>
        </button>
      </div>

      {modal === 'models' && <ModelSwitcherModal onClose={() => setModal(null)} />}
      {modal === 'plan' && <ArchitecturalPlanModal onClose={() => setModal(null)} />}
      {modal === 'autodev' && <AutoDevModal onClose={() => setModal(null)} />}
      {modal === 'graph' && <CodeGraphModal onClose={() => setModal(null)} />}
      {modal === 'blast' && <BlastRadiusModal onClose={() => setModal(null)} />}
      {modal === 'memory' && <ProjectMemoryModal onClose={() => setModal(null)} />}
      {modal === 'staging' && <AtomicStagingModal onClose={() => setModal(null)} />}
      {modal === 'boundary' && <BoundaryEnforcerModal onClose={() => setModal(null)} />}
    </div>
  );
}
