import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PlaygroundModal } from './PlaygroundModal';

export function PlaygroundButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white font-extrabold text-[10px] rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all"
        title="Buka AI Studio Pro Prompt Playground"
      >
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span className="hidden sm:inline">AI Studio Playground</span>
      </button>

      {open && <PlaygroundModal onClose={() => setOpen(false)} />}
    </>
  );
}
