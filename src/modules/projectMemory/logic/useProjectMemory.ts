import { useState, useEffect } from 'react';
import { ProjectContextIndex } from './types';
import { projectMemoryApi } from '../storage/projectMemoryApi';

export function useProjectMemory() {
  const [data, setData] = useState<ProjectContextIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIndex = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectMemoryApi.fetchContextIndex();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat memory index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndex();
  }, []);

  return { data, loading, error, refresh: loadIndex };
}
