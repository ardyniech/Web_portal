import React from 'react';
import { Button } from '../../../shared/atoms/Button';
import { AutoPilotBadge } from './AutoPilotBadge';
import {
  Trash2,
  ShieldAlert,
  GitPullRequest,
  Maximize2,
  Minimize2,
  Download,
  Mic,
  Brain,
  BrainCircuit,
  Activity,
  FlaskConical,
  Sparkles,
  BookOpen,
  ShieldCheck,
  HeartPulse,
  Wand2,
  Compass,
  PlayCircle,
  Zap,
  Layers,
  Cpu,
  Network,
  AlertOctagon,
  BookMarked,
  Shield,
} from 'lucide-react';

interface AiChatActionsProps {
  repoFullName: string | undefined;
  loading: boolean;
  isExpanded: boolean;
  canExport: boolean;
  onToggleExpand: () => void;
  onTriggerSecurityScan: () => void;
  onGeneratePrDraft: () => void;
  onTriggerContinuousDevelopment: () => void;
  onExportReport: () => void;
  onOpenModal: (name: string) => void;
  onClearChat: () => void;
}

export function AiChatActions(p: AiChatActionsProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <AutoPilotBadge />
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('codeGraph')} icon={<Network className="w-3.5 h-3.5 text-indigo-600" />} className="h-7 text-xs text-indigo-950 bg-indigo-50 hover:bg-indigo-100 font-bold border border-indigo-200">
        Code Graph
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('blastRadius')} icon={<AlertOctagon className="w-3.5 h-3.5 text-rose-600" />} className="h-7 text-xs text-rose-950 bg-rose-50 hover:bg-rose-100 font-bold border border-rose-200">
        Blast Radius
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('projectMemory')} icon={<BookMarked className="w-3.5 h-3.5 text-purple-600" />} className="h-7 text-xs text-purple-950 bg-purple-50 hover:bg-purple-100 font-bold border border-purple-200">
        Memory/ADR
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('atomicStaging')} icon={<Layers className="w-3.5 h-3.5 text-emerald-600" />} className="h-7 text-xs text-emerald-950 bg-emerald-50 hover:bg-emerald-100 font-bold border border-emerald-200">
        Sandbox Staging
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('boundaryEnforcer')} icon={<Shield className="w-3.5 h-3.5 text-blue-600" />} className="h-7 text-xs text-blue-950 bg-blue-50 hover:bg-blue-100 font-bold border border-blue-200">
        Boundary Linter
      </Button>
      <Button variant="ghost" size="sm" onClick={p.onTriggerContinuousDevelopment} icon={<Cpu className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />} className="h-7 text-xs text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-bold border border-emerald-200">
        Auto-Dev
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('prPreFlight')} icon={<ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />} className="h-7 text-xs text-rose-950 bg-rose-50 hover:bg-rose-100 font-bold border border-rose-200">
        Pre-Flight
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('repoVisualizer')} icon={<Network className="w-3.5 h-3.5 text-emerald-600" />} className="h-7 text-xs text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-bold border border-emerald-200">
        Visualizer
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('agentTaskQueue')} icon={<Layers className="w-3.5 h-3.5 text-indigo-600" />} className="h-7 text-xs text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-bold border border-indigo-200">
        Antrean
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('proactiveLinter')} icon={<Zap className="w-3.5 h-3.5 text-amber-600" />} className="h-7 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold border border-amber-200">
        Linter
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('ciPipeline')} icon={<PlayCircle className="w-3.5 h-3.5 text-indigo-600" />} className="h-7 text-xs text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-bold border border-indigo-200">
        CI/CD
      </Button>
      <Button variant="ghost" size="sm" onClick={() => p.onOpenModal('voice')} disabled={!p.repoFullName} icon={<Mic className="w-3.5 h-3.5 text-purple-600" />} className="h-7 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold border border-purple-200">
        Suara
      </Button>
      <Button variant="ghost" size="sm" onClick={p.onToggleExpand} icon={p.isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />} className="h-7 text-xs text-zinc-700 hover:bg-zinc-100 font-semibold border border-zinc-200">
        {p.isExpanded ? 'Kecil' : 'Lega'}
      </Button>
      <Button variant="ghost" size="sm" icon={<Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-600" />} onClick={p.onClearChat} className="h-7 text-zinc-500 hover:text-red-600 hover:bg-red-50">
        Reset
      </Button>
    </div>
  );
}
