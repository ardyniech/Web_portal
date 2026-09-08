import React from 'react';
import { useProjectMemory } from '../logic/useProjectMemory';
import { HybridSearchView } from './HybridSearchView';
import { AgentScratchpadView } from './AgentScratchpadView';
import { BookMarked, X, FileText, Sparkles, ListTodo } from 'lucide-react';

interface ProjectMemoryModalProps {
  onClose: () => void;
}

export function ProjectMemoryModal({ onClose }: ProjectMemoryModalProps) {
  const {
    data,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearch,
    epics,
    handleCreateEpic,
  } = useProjectMemory();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">Hierarchical Project Memory & Context Index</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                ADR Index, Vector Hybrid Symbol Search, & Agent Scratchpad untuk dekomposisi task besar
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
            onClick={() => setActiveTab('adr')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10.5px] cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'adr' ? 'bg-white text-purple-800 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-3 h-3" /> ADR Manifest
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10.5px] cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'search' ? 'bg-white text-purple-800 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sparkles className="w-3 h-3" /> Vector + Hybrid Search
          </button>
          <button
            onClick={() => setActiveTab('scratchpad')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10.5px] cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'scratchpad' ? 'bg-white text-purple-800 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ListTodo className="w-3 h-3" /> Task Hierarchy Scratchpad
          </button>
        </div>

        {activeTab === 'adr' && (
          <>
            <div className="grid grid-cols-2 gap-2 bg-purple-50/50 p-2 rounded-xl border border-purple-200">
              <div>
                <span className="text-[10px] text-zinc-500">Estimasi Penghematan Token:</span>
                <strong className="block text-purple-700 text-xs font-bold">~{data?.estimatedTokensSaved || 0} Tokens / Req</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500">Aturan Arsitektur:</span>
                <strong className="block text-zinc-800 text-xs font-bold">{data?.totalRules || 0} Terindeks</strong>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[180px] pr-1 max-h-[300px]">
              {data?.adrs.map((adr) => (
                <div key={adr.id} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-800 text-[11px]">{adr.id}: {adr.title}</span>
                    <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                      {adr.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-medium">{adr.decision}</p>
                  <p className="text-[9.5px] text-zinc-400 font-mono">Konsekuensi: {adr.consequences.join(', ')}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'search' && (
          <HybridSearchView
            query={searchQuery}
            setQuery={setSearchQuery}
            results={searchResults}
            loading={loading}
            onSearch={handleSearch}
          />
        )}

        {activeTab === 'scratchpad' && (
          <AgentScratchpadView
            epics={epics}
            onCreateEpic={handleCreateEpic}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
