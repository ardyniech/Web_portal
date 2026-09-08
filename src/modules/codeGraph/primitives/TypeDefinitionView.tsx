import React from 'react';
import { TypeDefinitionResult } from '../logic/types';
import { Search, Code2, Copy, Check, FileText } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface TypeDefinitionViewProps {
  query: string;
  setQuery: (q: string) => void;
  result: TypeDefinitionResult | null;
  loading: boolean;
  onResolve: (t: string) => void;
}

export function TypeDefinitionView({ query, setQuery, result, loading, onResolve }: TypeDefinitionViewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!result?.fullDefinitionText) return;
    navigator.clipboard.writeText(result.fullDefinitionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari interface / tipe publik (cth: CodeGraphData, BlastRadiusResult)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onResolve(query)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <Button size="sm" onClick={() => onResolve(query)} className="h-8 px-3 text-xs bg-indigo-600 text-white font-bold">
          {loading ? 'Mengekstrak...' : 'Ambil Tipe'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 max-h-[340px]">
        {!result ? (
          <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
            <Code2 className="w-6 h-6 text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-600">Type-Definition Resolver (Zero Context Waste)</p>
            <p className="text-[10px] text-zinc-400 text-center">
              Ekstrak tanda tangan tipe interface publik langsung dari AST tanpa perlu membaca ribuan baris kode implementasi.
            </p>
          </div>
        ) : !result.found ? (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-center text-xs font-medium">
            Tipe "{result.target}" tidak ditemukan di antarmuka publik modul.
          </div>
        ) : (
          <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl flex flex-col gap-2 font-mono text-[10.5px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="text-[10px] text-indigo-400 font-sans font-bold flex items-center gap-1">
                <FileText className="w-3 h-3" /> {result.filePath}
              </span>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white flex items-center gap-1 text-[9.5px] cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Tipe'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre p-1 text-emerald-300 leading-relaxed font-mono">
              {result.fullDefinitionText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
