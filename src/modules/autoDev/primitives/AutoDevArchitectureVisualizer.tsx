import React from 'react';
import { Layers, Server, Cpu, Database, Network } from 'lucide-react';
import { CodeProposalTarget } from '../logic/types';

interface AutoDevArchitectureVisualizerProps {
  targets: CodeProposalTarget[];
}

export function AutoDevArchitectureVisualizer({ targets }: AutoDevArchitectureVisualizerProps) {
  const getLayerInfo = (filePath: string) => {
    if (filePath.includes('/primitives/')) return { layer: 'UI Layer', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Layers };
    if (filePath.includes('/logic/')) return { layer: 'Logic / Hook', color: 'bg-blue-50 text-blue-800 border-blue-200', icon: Cpu };
    if (filePath.includes('/storage/')) return { layer: 'Storage / Adapter', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Database };
    if (filePath.startsWith('server/')) return { layer: 'Express Server', color: 'bg-purple-50 text-purple-800 border-purple-200', icon: Server };
    return { layer: 'System Core', color: 'bg-zinc-50 text-zinc-800 border-zinc-200', icon: Network };
  };

  return (
    <div className="p-2 bg-white/90 border border-purple-200 rounded-xl flex flex-col gap-1.5 text-[9.5px]">
      <div className="flex items-center gap-1.5 font-bold text-purple-900 border-b border-purple-100 pb-1">
        <Network className="w-3.5 h-3.5 text-purple-600" />
        <span>Arsitektur Layer Proposal Fitur ({targets.length} Berkas)</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {targets.map((tgt, idx) => {
          const info = getLayerInfo(tgt.filePath);
          const Icon = info.icon;
          const fileName = tgt.filePath.split('/').pop();
          return (
            <div key={idx} className={`p-1.5 border rounded-lg flex items-center gap-1.5 font-mono ${info.color}`}>
              <Icon className="w-3 h-3 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="font-bold truncate" title={tgt.filePath}>{fileName}</span>
                <span className="text-[8px] opacity-75">{info.layer}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
