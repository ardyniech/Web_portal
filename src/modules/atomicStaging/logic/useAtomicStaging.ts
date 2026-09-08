import { useState, useEffect } from 'react';
import { StagingTransaction, IsolatedSuiteResult } from './types';
import { atomicStagingApi } from '../storage/atomicStagingApi';
import { dispatcher } from '../../../core/dispatcher';

export function useAtomicStaging() {
  const [transactions, setTransactions] = useState<StagingTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'staging' | 'targetedTests'>('staging');
  const [testResult, setTestResult] = useState<IsolatedSuiteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await atomicStagingApi.fetchTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const runTargetedTestSuite = async (modules: string[] = ['codeGraph', 'blastRadius', 'projectMemory']) => {
    setLoading(true);
    setError(null);
    try {
      const res = await atomicStagingApi.runTargetedTests(modules);
      setTestResult(res);
    } catch (err: any) {
      setError(err?.message || 'Gagal menjalankan targeted tests.');
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

  return {
    transactions,
    activeTab,
    setActiveTab,
    testResult,
    runTargetedTestSuite,
    loading,
    error,
    commit,
    rollback,
    refresh: loadTransactions,
  };
}
