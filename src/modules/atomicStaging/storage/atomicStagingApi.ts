import { StagingTransaction, IsolatedSuiteResult } from '../logic/types';

export const atomicStagingApi = {
  async fetchTransactions(): Promise<StagingTransaction[]> {
    const res = await fetch('/api/staging/transactions');
    if (!res.ok) throw new Error('Gagal memuat transaksi staging');
    return res.json();
  },

  async runTargetedTests(modules: string[]): Promise<IsolatedSuiteResult> {
    const res = await fetch('/api/staging/targeted-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules }),
    });
    if (!res.ok) throw new Error('Gagal menjalankan targeted isolated tests');
    return res.json();
  },

  async commitTransaction(transactionId: string): Promise<{ success: boolean; commitHash: string }> {
    const res = await fetch('/api/staging/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    });
    if (!res.ok) throw new Error('Gagal menerapkan commit atomik');
    return res.json();
  },

  async rollbackTransaction(transactionId: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/staging/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    });
    if (!res.ok) throw new Error('Gagal melakukan rollback transaksi');
    return res.json();
  },
};
