import React from 'react';
import { Gauge, Zap, Sparkles } from 'lucide-react';

interface TokenMeterCardProps {
  systemLen: number;
  promptLen: number;
}

export function TokenMeterCard({ systemLen, promptLen }: TokenMeterCardProps) {
  const estimatedTokens = Math.round((systemLen + promptLen) / 4);
  const maxCapacity = 1_000_000;
  const pct = Math.min(100, (estimatedTokens / maxCapacity) * 100);

  return (
    <div className="p-2.5 bg-gradient-to-r from-zinc-900 to-indigo-950 text-white rounded-xl border border-indigo-950 flex flex-col gap-1.5 text-[10px]">
      <div className="flex items-center justify-between">
        <span className="font-bold font-mono text-indigo-300 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          <span>Context Window Capacity (1M Tokens)</span>
        </span>
        <span className="font-mono text-emerald-400 font-bold">
          ~{estimatedTokens.toLocaleString()} / 1,000,000 Tokens
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-400 via-indigo-500 to-amber-400 h-full transition-all duration-300"
          style={{ width: `${Math.max(1, pct)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[8.5px] text-zinc-400 font-mono">
        <span>Gunakan instruksi presisi untuk efisiensi konteks</span>
        <span className="text-amber-300 font-bold flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          Hemat ~98% kuota via Smart Fallback Engine
        </span>
      </div>
    </div>
  );
}
