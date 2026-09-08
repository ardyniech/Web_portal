import React from 'react';
import { HybridSearchResult } from '../logic/types';
import { Search, Sparkles, BookOpen, Layers, Code, FileText } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface HybridSearchViewProps {
  query: string;
  setQuery: (q: string) => void;
  results: HybridSearchResult[];
  loading: boolean;
  onSearch: (q: string) => void;
}

export function HybridSearchView({ query, setQuery, results, loading, onSearch }: HybridSearchViewProps) {
  return (
    <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari konsep bisnis, modul, atau aturan ADR (cth: batasan baris, git push, dispatcher)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>
        <Button size="sm" onClick={() => onSearch(query)} className="h-8 px-3 text-xs bg-purple-600 text-white font-bold">
          {loading ? 'Mencari...' : 'Hybrid Search'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 max-h-[340px]">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
            <Sparkles className="w-6 h-6 text-purple-300" />
            <p className="text-xs font-semibold text-zinc-600">Vector + Hybrid Symbol Search Engine</p>
            <p className="text-[10px] text-zinc-400 text-center">
              Temukan definisi bisnis, modul seluler, kontrak API, dan pedoman arsitektur dalam satu kueri terpadu.
            </p>
          </div>
        ) : (
          results.map((r) => (
            <div key={r.id} className="p-2.5 bg-zinc-50 hover:bg-purple-50/40 border border-zinc-200 rounded-xl flex flex-col gap-1 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 text-[11px] flex items-center gap-1.5">
                  {r.category === 'adr' ? <BookOpen className="w-3.5 h-3.5 text-purple-600" /> : <Layers className="w-3.5 h-3.5 text-indigo-600" />}
                  {r.title}
                </span>
                <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded">
                  {r.category}
                </span>
              </div>
              <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">{r.snippet}</p>
              {r.filePath && (
                <span className="text-[9px] font-mono text-zinc-400 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {r.filePath}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
