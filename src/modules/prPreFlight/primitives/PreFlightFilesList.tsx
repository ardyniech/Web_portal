import React from 'react';
import { PreFlightFileReview } from '../logic/types';
import { FileCode, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface PreFlightFilesListProps {
  files: PreFlightFileReview[];
}

export function PreFlightFilesList({ files }: PreFlightFilesListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5" /> Berkas Terperiksa ({files.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        {files.map((file, idx) => {
          const isPassed = file.status === 'passed';
          const isFailed = file.status === 'failed';

          return (
            <div
              key={idx}
              className={`p-2 rounded-lg border flex flex-col gap-0.5 transition-colors ${
                isPassed
                  ? 'bg-emerald-50/40 border-emerald-200/60'
                  : isFailed
                  ? 'bg-rose-50/40 border-rose-200/60'
                  : 'bg-amber-50/40 border-amber-200/60'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-zinc-800 truncate text-[10.5px]" title={file.filePath}>
                  {file.filePath.split('/').pop()}
                </span>
                {isPassed ? (
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : isFailed ? (
                  <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-between text-[9px] text-zinc-500">
                <span>{file.linesChanged} baris</span>
                {file.issuesCount > 0 ? (
                  <span className="font-bold text-rose-600">{file.issuesCount} Masalah</span>
                ) : (
                  <span className="font-bold text-emerald-600">Lolos</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
