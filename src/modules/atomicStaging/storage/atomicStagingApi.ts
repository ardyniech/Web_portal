import { StagingTransaction } from '../logic/types';

export const atomicStagingApi = {
  async getTransactions(): Promise<StagingTransaction[]> {
    const res = await fetch('/api/staging/transactions');
    if (!res.ok) {
      throw new Error('Gagal mengambil transaksi staging');
    }
    return res.json();
  },

  async commitTransaction(id: string): Promise<{ success: boolean; commitHash: string }> {
    const res = await fetch(`/api/staging/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: id }),
    });
    if (!res.ok) {
      throw new Error('Gagal melakukan atomic commit transaksi');
    }
    return res.json();
  },

  async rollbackTransaction(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/staging/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: id }),
    });
    if (!res.ok) {
      throw new Error('Gagal melakukan rollback transaksi');
    }
    return res.json();
  },
};
