import React from 'react';
import { Sparkles, X, Terminal, Code2, Zap } from 'lucide-react';

interface PlaygroundHeaderProps {
  onClose: () => void;
  onOpenSdkModal: () => void;
}

export function PlaygroundHeader({ onClose, onOpenSdkModal }: PlaygroundHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white rounded-lg shadow-sm">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-zinc-900 leading-none flex items-center gap-1.5">
            AI Studio Pro Prompt Playground <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[9px] font-extrabold uppercase">Ultra Mode</span>
          </h3>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Area Uji Prompt Multi-Model, SDK Generator, &amp; Auto Dev Integration Superior
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSdkModal}
          className="px-2.5 py-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-indigo-200"
        >
          <Code2 className="w-3.5 h-3.5" /> <span>Get Code (SDK)</span>
        </button>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
