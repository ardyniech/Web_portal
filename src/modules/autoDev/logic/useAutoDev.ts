import { useState, useEffect } from 'react';
import { AutoDevPipelineRun } from './types';
import { autoDevApi } from '../storage/autoDevApi';
import { dispatcher } from '../../../core/dispatcher';

export function useAutoDev() {
  const [history, setHistory] = useState<AutoDevPipelineRun[]>([]);
  const [currentRun, setCurrentRun] = useState<AutoDevPipelineRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskGoal, setTaskGoal] = useState('Autonomous Refactor & High-Reliability Verification');
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await autoDevApi.fetchHistory();
      setHistory(data);
    } catch (err: any) {
      console.error('[Module:AutoDev] Error loading history:', err);
    }
  };

  const runPipeline = async (goal?: string) => {
    const targetGoal = goal || taskGoal;
    setLoading(true);
    setError(null);
    try {
      const run = await autoDevApi.runPipeline(targetGoal);
      setCurrentRun(run);
      setHistory((prev) => [run, ...prev]);
      dispatcher.emit('git:status_updated', {});
    } catch (err: any) {
      setError(err?.message || 'Gagal mengeksekusi Auto Dev Pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return {
    history,
    currentRun,
    loading,
    taskGoal,
    setTaskGoal,
    error,
    runPipeline,
    refreshHistory: loadHistory,
  };
}
