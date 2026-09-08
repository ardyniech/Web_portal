import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface PreFlightHeaderProps {
  onClose: () => void;
  model?: string;
}

export function PreFlightHeader({ onClose, model }: PreFlightHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-zinc-900 leading-none">AI PR Pre-Flight Audit</h3>
            {model && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {model}
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Audit peer-review tingkat tinggi untuk memeriksa celah keamanan dan pelanggaran arsitektur
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer transition-colors"
        title="Tutup Modal"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
