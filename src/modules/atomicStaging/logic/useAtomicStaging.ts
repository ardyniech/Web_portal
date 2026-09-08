import { useState, useEffect } from 'react';
import { StagingTransaction } from './types';
import { atomicStagingApi } from '../storage/atomicStagingApi';
import { dispatcher } from '../../../core/dispatcher';

export function useAtomicStaging() {
  const [transactions, setTransactions] = useState<StagingTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await atomicStagingApi.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const commit = async (id: string) => {
    try {
      await atomicStagingApi.commitTransaction(id);
      dispatcher.emit('git:status_updated', {});
      loadTransactions();
    } catch (err: any) {
      setError(err?.message || 'Gagal commit.');
    }
  };

  const rollback = async (id: string) => {
    try {
      await atomicStagingApi.rollbackTransaction(id);
      loadTransactions();
    } catch (err: any) {
      setError(err?.message || 'Gagal rollback.');
    }
  };

  return { transactions, loading, error, commit, rollback, refresh: loadTransactions };
}
