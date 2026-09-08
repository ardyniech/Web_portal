import React from 'react';
import { Cpu, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { ModelResponseResult } from '../logic/types';

interface ModelArenaCardProps {
  result: ModelResponseResult;
  onSynthesizeToCode?: (text: string) => void;
}

export function ModelArenaCard({ result, onSynthesizeToCode }: ModelArenaCardProps) {
  return (
    <div className="p-3 bg-white border border-zinc-200 rounded-xl flex flex-col gap-2 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 text-[10px]">
        <div className="flex items-center gap-1.5 font-bold text-zinc-900">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-mono">{result.modelName}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px]">
          <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
            <Clock className="w-3 h-3" /> {result.latencyMs}ms
          </span>
          <span className="flex items-center gap-0.5 text-purple-600 font-bold">
            <Zap className="w-3 h-3" /> {result.tokensUsed} Tokens
          </span>
        </div>
      </div>

      {result.error ? (
        <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-bold">
          {result.error}
        </div>
      ) : (
        <div className="bg-zinc-900 text-zinc-100 p-2.5 rounded-lg font-mono text-[10px] whitespace-pre-wrap max-h-[160px] overflow-y-auto leading-relaxed border border-zinc-800">
          {result.text}
        </div>
      )}

      {onSynthesizeToCode && !result.error && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => onSynthesizeToCode(result.text)}
            className="px-2.5 py-1 text-[9.5px] bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white font-black rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Auto Dev Code Synthesizer</span>
          </button>
        </div>
      )}
    </div>
  );
}
