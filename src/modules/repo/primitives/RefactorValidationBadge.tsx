import React from 'react';
import { RefactorValidation } from '../logic/aiRefactorTypes';
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface RefactorValidationBadgeProps {
  validation?: RefactorValidation;
}

export function RefactorValidationBadge({ validation }: RefactorValidationBadgeProps) {
  if (!validation) return null;

  if (!validation.isValid && validation.errors.length > 0) {
    return (
      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 font-bold text-rose-900">
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Validasi AST Menemukan Error Sintaks:</span>
        </div>
        <ul className="list-disc list-inside pl-1 space-y-0.5 font-mono text-[9.5px]">
          {validation.errors.map((e, idx) => (
            <li key={idx}>Baris {e.line}: {e.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        AST Valid (TypeScript Compiler In-Memory)
      </span>
      {validation.warnings.map((w, i) => (
        <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {w}
        </span>
      ))}
    </div>
  );
}
