import React from 'react';
import { useAtomicStaging } from '../logic/useAtomicStaging';
import { Layers, X, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface AtomicStagingModalProps {
  onClose: () => void;
}

export function AtomicStagingModal({ onClose }: AtomicStagingModalProps) {
  const { transactions, commit, rollback } = useAtomicStaging();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 border border-zinc-200 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 leading-none">Atomic Multi-File Transaction Engine</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Staging in-memory terisolasi dengan rollback otomatis bila terjadi galat tipe atau tes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[200px]">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 gap-1.5">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <p className="font-bold text-zinc-700 text-xs">Semua Transaksi Bersih & Tersinkron</p>
              <p className="text-[10px]">Tidak ada staged transaction yang tertunda di memori sandbox.</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 text-[11px]">{tx.description}</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded">
                    {tx.status}
                  </span>
                </div>
                <div className="text-[9.5px] text-zinc-500">
                  Berkas termodifikasi: {tx.files.map((f) => f.filePath).join(', ')}
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <Button size="sm" onClick={() => rollback(tx.id)} icon={<RotateCcw className="w-3 h-3" />} className="h-6 text-[9.5px] bg-rose-50 text-rose-800 border-rose-200">
                    Rollback
                  </Button>
                  <Button size="sm" onClick={() => commit(tx.id)} icon={<CheckCircle2 className="w-3 h-3" />} className="h-6 text-[9.5px] bg-emerald-50 text-emerald-800 border-emerald-200">
                    Atomic Commit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
