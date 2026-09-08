import React from 'react';
import { useCodeGraph } from '../logic/useCodeGraph';
import { CodeGraphNodeCard } from './CodeGraphNodeCard';
import { CodeGraphDetail } from './CodeGraphDetail';
import { SymbolReferencesView } from './SymbolReferencesView';
import { TypeDefinitionView } from './TypeDefinitionView';
import { Network, X, Search, Hash, Code2 } from 'lucide-react';

interface ModalProps { onClose: () => void; }

export function CodeGraphModal({ onClose }: ModalProps) {
  const ctx = useCodeGraph();
  
  const renderContent = () => {
    try {
      switch (ctx.activeTab) {
        case 'references': return <SymbolReferencesView query={ctx.symbolQuery} setQuery={ctx.setSymbolQuery} result={ctx.symbolResult} loading={ctx.loading} onSearch={ctx.searchReferences} />;
        case 'typedef': return <TypeDefinitionView query={ctx.typeQuery} setQuery={ctx.setTypeQuery} result={ctx.typeResult} loading={ctx.loading} onResolve={ctx.resolveType} />;
        default:
          return (
            <>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input type="text" placeholder="Cari modul..." value={ctx.searchQuery} onChange={(e) => ctx.setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-hidden min-h-[260px]">
                <div className="overflow-y-auto flex flex-col gap-1.5 pr-1 max-h-[340px]">
                  {ctx.filteredNodes.map((n) => <CodeGraphNodeCard key={n.id} node={n} isSelected={n.id === ctx.selectedNodeId} onSelect={ctx.setSelectedNodeId} />)}
                </div>
                <CodeGraphDetail node={ctx.selectedNode} />
              </div>
            </>
          );
      }
    } catch (e) { console.error('[Module:CodeGraph] Error in renderContent:', e); return null; }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2"><div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg"><Network className="w-4 h-4" /></div><div><h3 className="text-xs font-bold">Code Graph Explorer</h3></div></div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          {[ { id: 'graph', icon: Network, label: 'Graph' }, { id: 'references', icon: Hash, label: 'Refs' }, { id: 'typedef', icon: Code2, label: 'Types' } ].map(t => (
            <button key={t.id} onClick={() => ctx.setActiveTab(t.id as any)} className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10.5px] flex items-center justify-center gap-1.5 ${ctx.activeTab === t.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-zinc-500'}`}>
              <t.icon className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </div>
        {renderContent()}
      </div>
    </div>
  );
}