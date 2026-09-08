import React from 'react';
import { useCodeGraph } from '../logic/useCodeGraph';
import { CodeGraphNodeCard } from './CodeGraphNodeCard';
import { CodeGraphDetail } from './CodeGraphDetail';
import { Network, X, Search, RefreshCw, AlertTriangle, Layers } from 'lucide-react';

interface CodeGraphModalProps {
  onClose: () => void;
}

export function CodeGraphModal({ onClose }: CodeGraphModalProps) {
  const {
    data,
    loading,
    searchQuery,
    setSearchQuery,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    filteredNodes,
    refreshGraph,
  } = useCodeGraph();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">Code Graph & AST Symbol Explorer</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Navigasi dependensi modular, deteksi siklus impor, dan pencarian simbol AST
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>{data?.totalFiles || 0} Modul/Berkas</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-medium">
              <Network className="w-3.5 h-3.5 text-emerald-500" />
              <span>{data?.totalDependencies || 0} Relasi Impor</span>
            </div>
            {data && data.circularCount > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>{data.circularCount} Siklus Terdeteksi!</span>
              </div>
            )}
          </div>
          <button
            onClick={refreshGraph}
            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded cursor-pointer transition-colors"
            title="Muat Ulang Graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari modul atau berkas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-hidden min-h-[260px]">
          <div className="overflow-y-auto flex flex-col gap-1.5 pr-1 max-h-[380px]">
            {filteredNodes.map((node) => (
              <CodeGraphNodeCard
                key={node.id}
                node={node}
                isSelected={node.id === selectedNodeId}
                onSelect={setSelectedNodeId}
              />
            ))}
          </div>
          <CodeGraphDetail node={selectedNode} />
        </div>
      </div>
    </div>
  );
}
