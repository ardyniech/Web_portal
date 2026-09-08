import { useState, useEffect } from 'react';
import { BlastRadiusResult } from './types';
import { blastRadiusApi } from '../storage/blastRadiusApi';

export function useBlastRadius() {
  const [results, setResults] = useState<BlastRadiusResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<BlastRadiusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaceRadius = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blastRadiusApi.getRecentWorkspaceBlast();
      setResults(data);
      if (data.length > 0) setSelectedResult(data[0]);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat blast radius.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceRadius();
  }, []);

  const analyzeSpecificFile = async (filePath: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await blastRadiusApi.analyzeFile(filePath);
      setSelectedResult(res);
    } catch (err: any) {
      setError(err?.message || 'Analisis berkas gagal.');
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    selectedResult,
    setSelectedResult,
    loading,
    error,
    analyzeSpecificFile,
    refresh: loadWorkspaceRadius,
  };
}
