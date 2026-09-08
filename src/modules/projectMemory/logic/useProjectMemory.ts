import { useState, useEffect } from 'react';
import { ProjectContextIndex, HybridSearchResult, EpicTask } from './types';
import { projectMemoryApi } from '../storage/projectMemoryApi';

export function useProjectMemory() {
  const [data, setData] = useState<ProjectContextIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'adr' | 'search' | 'scratchpad'>('adr');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HybridSearchResult[]>([]);
  const [epics, setEpics] = useState<EpicTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadIndex = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectMemoryApi.fetchIndex();
      setData(res);
      const epicList = await projectMemoryApi.fetchEpics();
      setEpics(epicList);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat memory index.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await projectMemoryApi.searchMemory(q);
      setSearchResults(res);
    } catch (err: any) {
      setError(err?.message || 'Gagal melakukan pencarian.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEpic = async (title: string, goal: string) => {
    setLoading(true);
    try {
      const created = await projectMemoryApi.createEpic(title, goal);
      setEpics((prev) => [created, ...prev]);
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat epic.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndex();
  }, []);

  return {
    data,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearch,
    epics,
    handleCreateEpic,
    refresh: loadIndex,
  };
}
