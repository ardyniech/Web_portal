import React from 'react';
import { RefactorChange } from '../logic/aiRefactorTypes';
import { FileCode, PlusCircle, Edit3 } from 'lucide-react';

interface RefactorFileTabsProps {
  changes: RefactorChange[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function RefactorFileTabs({ changes, activeIndex, onSelect }: RefactorFileTabsProps) {
  if (changes.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200">
      <span className="text-[10px] font-bold text-zinc-500 uppercase shrink-0 mr-1">
        Berkas ({changes.length}):
      </span>
      {changes.map((change, idx) => {
        const isSelected = activeIndex === idx;
        const isNew = change.action === 'create' || !change.originalCode;
        const shortName = change.fileName.split('/').pop() || change.fileName;

        return (
          <button
            key={change.fileName + idx}
            type="button"
            onClick={() => onSelect(idx)}
            className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-purple-600 text-white border-purple-700 shadow-2xs font-bold'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            {isNew ? (
              <PlusCircle className={`w-3 h-3 ${isSelected ? 'text-purple-200' : 'text-emerald-600'}`} />
            ) : (
              <Edit3 className={`w-3 h-3 ${isSelected ? 'text-purple-200' : 'text-zinc-400'}`} />
            )}
            <span>{shortName}</span>
            {change.validation && !change.validation.isValid && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}
