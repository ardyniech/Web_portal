import { useState, useEffect } from 'react';
import { ModelHealthStatus, ModelSwitchEvent } from './types';
import { modelApi } from '../storage/modelApi';

export function useModelSwitcher() {
  const [models, setModels] = useState<ModelHealthStatus[]>([]);
  const [switchLogs, setSwitchLogs] = useState<ModelSwitchEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const data = await modelApi.fetchStatuses();
      setModels(data.models);
      setSwitchLogs(data.switchLogs);
    } catch (err: any) {
      console.error('[Module:ModelSwitcher] Error loading status:', err);
      setError(err?.message || 'Gagal memuat status model');
    }
  };

  const switchModel = async (modelName: string) => {
    setLoading(true);
    try {
      await modelApi.switchPrimary(modelName);
      await loadStatus();
    } catch (err: any) {
      setError(err?.message || 'Gagal beralih model');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    models,
    switchLogs,
    loading,
    error,
    refreshStatus: loadStatus,
    switchModel,
  };
}
