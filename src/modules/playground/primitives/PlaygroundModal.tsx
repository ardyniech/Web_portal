import React, { useState } from 'react';
import { PlaygroundHeader } from './PlaygroundHeader';
import { ModelArenaCard } from './ModelArenaCard';
import { SdkExporterModal } from './SdkExporterModal';
import { TokenMeterCard } from './TokenMeterCard';
import { usePlayground } from '../logic/usePlayground';
import { Play, Sparkles, Sliders, Shield } from 'lucide-react';

interface PlaygroundModalProps {
  onClose: () => void;
  onSynthesizeToCode?: (prompt: string) => void;
}

export function PlaygroundModal({ onClose, onSynthesizeToCode }: PlaygroundModalProps) {
  const { config, setConfig, running, results, runArena } = usePlayground();
  const [showSdkModal, setShowSdkModal] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[92vh] overflow-hidden text-xs">
        <PlaygroundHeader onClose={onClose} onOpenSdkModal={() => setShowSdkModal(true)} />

        <TokenMeterCard systemLen={config.systemInstruction.length} promptLen={config.userPrompt.length} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 overflow-y-auto">
          {/* Controls */}
          <div className="md:col-span-4 flex flex-col gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
            <span className="font-bold text-zinc-900 text-[10.5px] flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-600" /> System Instruction &amp; Parameters
            </span>
            <textarea
              value={config.systemInstruction}
              onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
              placeholder="Petunjuk Sistem AI..."
              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-[10px] h-20 focus:outline-none font-mono"
            />
            <div className="flex flex-col gap-1 text-[9.5px]">
              <div className="flex justify-between font-bold">
                <span>Temperature</span>
                <span>{config.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
            <div className="flex flex-col gap-1 text-[9.5px]">
              <div className="flex justify-between font-bold">
                <span>Thinking Budget (Tokens)</span>
                <span>{config.thinkingBudget}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8192"
                step="512"
                value={config.thinkingBudget}
                onChange={(e) => setConfig({ ...config, thinkingBudget: parseInt(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          {/* Prompt & Arena Output */}
          <div className="md:col-span-8 flex flex-col gap-2 min-w-0">
            <textarea
              value={config.userPrompt}
              onChange={(e) => setConfig({ ...config, userPrompt: e.target.value })}
              placeholder="Ketik prompt pengujian Anda di sini..."
              className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs h-24 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <div className="flex justify-end">
              <button
                onClick={runArena}
                disabled={running || !config.userPrompt.trim()}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                <span>{running ? 'Menjalankan Multi-Model...' : 'Jalankan Arena Prompt'}</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
              {results.map((res, idx) => (
                <ModelArenaCard
                  key={idx}
                  result={res}
                  onSynthesizeToCode={(txt) => {
                    if (onSynthesizeToCode) onSynthesizeToCode(txt);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {showSdkModal && <SdkExporterModal config={config} onClose={() => setShowSdkModal(false)} />}
      </div>
    </div>
  );
}
