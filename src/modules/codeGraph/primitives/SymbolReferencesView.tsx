import React from 'react';
import { SymbolReferenceResult } from '../logic/types';
import { Search, Hash, FileCode, CheckCircle } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface SymbolReferencesViewProps {
  query: string;
  setQuery: (q: string) => void;
  result: SymbolReferenceResult | null;
  loading: boolean;
  onSearch: (q: string) => void;
}

export function SymbolReferencesView({ query, setQuery, result, loading, onSearch }: SymbolReferencesViewProps) {
  return (
    <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Ketik nama fungsi, tipe, atau interface (cth: dispatcher, useCodeGraph)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <Button size="sm" onClick={() => onSearch(query)} className="h-8 px-3 text-xs bg-indigo-600 text-white font-bold">
          {loading ? 'Mencari...' : 'Cari Simbol'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 max-h-[340px]">
        {!result ? (
          <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
            <Hash className="w-6 h-6 text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-600">LSP Symbol Reference Finder</p>
            <p className="text-[10px] text-zinc-400 text-center">
              Temukan seluruh pemanggilan, deklarasi, dan import suatu tipe/fungsi di seluruh berkas proyek sebelum refaktor.
            </p>
          </div>
        ) : result.matches.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-center text-xs font-medium">
            Tidak ditemukan referensi untuk simbol "{result.symbolName}".
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 font-medium">
              <span>Ditemukan {result.totalOccurrences} referensi di {result.filesCount} berkas</span>
              <span className="font-mono text-indigo-600 font-bold">{result.symbolName}</span>
            </div>
            {result.matches.map((m, idx) => (
              <div key={idx} className="p-2 bg-zinc-50 hover:bg-indigo-50/40 border border-zinc-200 rounded-xl flex flex-col gap-0.5 transition-colors">
                <div className="flex items-center justify-between text-[9.5px]">
                  <span className="font-bold text-zinc-800 font-mono flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-indigo-500 shrink-0" /> {m.filePath}:{m.lineNumber}
                  </span>
                  <span className={`text-[8.5px] font-extrabold uppercase px-1 py-0.2 rounded ${
                    m.kind === 'declaration' ? 'bg-purple-100 text-purple-800' : m.kind === 'import' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {m.kind}
                  </span>
                </div>
                <code className="text-[9.5px] font-mono bg-white p-1 rounded border border-zinc-200 text-zinc-700 overflow-x-auto block">
                  {m.lineContent}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
