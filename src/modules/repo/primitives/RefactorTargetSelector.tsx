import React from 'react';
import { FileCandidate } from '../logic/aiRefactorTypes';
import { Sparkles, FileCode, Target, ArrowRight } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface RefactorTargetSelectorProps {
  candidates: FileCandidate[];
  selectedFile: string;
  onSelectFile: (path: string) => void;
  selectedGoal: string;
  onSelectGoal: (goal: string) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const GOALS = [
  'Dekomposisi Modular (<125 Baris)',
  'Pecah Jadi Sub-Komponen',
  'Strict Typing & Zero-Any',
  'SOP Error Handling & Traceability',
  'Optimasi Render & Reduksi Overhead',
];

export function RefactorTargetSelector({
  candidates,
  selectedFile,
  onSelectFile,
  selectedGoal,
  onSelectGoal,
  isAnalyzing,
  onAnalyze,
}: RefactorTargetSelectorProps) {
  return (
    <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl flex flex-col gap-2.5">
      {/* File Target Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5 text-purple-600" />
          <span>Pilih Berkas Target:</span>
        </label>
        <select
          value={selectedFile}
          onChange={(e) => onSelectFile(e.target.value)}
          disabled={isAnalyzing}
          className="text-[11px] bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 font-mono text-zinc-800 focus:ring-1 focus:ring-purple-500 focus:outline-none flex-1 max-w-sm cursor-pointer"
        >
          {candidates.map((c) => (
            <option key={c.path} value={c.path}>
              {c.path} ({c.lines} baris {c.priority === 'high' ? '⚠️' : ''})
            </option>
          ))}
        </select>
      </div>

      {/* Goal Buttons */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
          <Target className="w-3 h-3 text-zinc-400" /> Sasaran Perbaikan AI:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onSelectGoal(g)}
              disabled={isAnalyzing}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedGoal === g
                  ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Trigger Button */}
      <div className="flex justify-end pt-1">
        <Button
          size="sm"
          onClick={onAnalyze}
          disabled={isAnalyzing || !selectedFile}
          icon={isAnalyzing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
          className="h-7 text-[10px] font-bold bg-purple-700 hover:bg-purple-800 text-white px-3 rounded-lg shadow-2xs"
        >
          {isAnalyzing ? 'Menganalisis Kode Riil...' : 'Cetuskan Refaktor AI'}
        </Button>
      </div>
    </div>
  );
}
