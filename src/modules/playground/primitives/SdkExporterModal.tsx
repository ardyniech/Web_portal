import React, { useState } from 'react';
import { X, Copy, Check, Code2 } from 'lucide-react';
import { PromptConfig, SdkExportFormat } from '../logic/types';
import { playgroundApi } from '../storage/playgroundApi';

interface SdkExporterModalProps {
  config: PromptConfig;
  onClose: () => void;
}

export function SdkExporterModal({ config, onClose }: SdkExporterModalProps) {
  const [activeLang, setActiveLang] = useState<SdkExportFormat['language']>('python');
  const [copied, setCopied] = useState(false);

  const code = playgroundApi.generateSdkCode(config, activeLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-4 text-white shadow-2xl flex flex-col gap-3 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs">Universal SDK Code Exporter</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
          {(['python', 'typescript', 'curl'] as SdkExportFormat['language'][]).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 rounded-lg font-mono text-[10px] uppercase font-bold cursor-pointer transition-all ${
                activeLang === lang ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="relative bg-black p-3 rounded-xl font-mono text-[10.5px] border border-zinc-800 text-emerald-400 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[9px] font-bold cursor-pointer flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
          </button>
          {code}
        </div>
      </div>
    </div>
  );
}
