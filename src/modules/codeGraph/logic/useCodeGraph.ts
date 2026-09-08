import { useState, useEffect } from 'react';
import { CodeGraphData, SymbolReference } from './types';
import { codeGraphApi } from '../storage/codeGraphApi';
import { dispatcher } from '../../../core/dispatcher';

export function useCodeGraph() {
  const [data, setData] = useState<CodeGraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const graph = await codeGraphApi.fetchGraph();
      setData(graph);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat graph.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
    const unsub = dispatcher.on('git:status_updated', () => {
      loadGraph();
    });
    return () => unsub();
  }, []);

  const filteredNodes = data?.nodes.filter((n) => {
    if (!searchQuery) return true;
    return n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.filePath.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const selectedNode = data?.nodes.find((n) => n.id === selectedNodeId) || null;

  return {
    data,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    filteredNodes,
    refreshGraph: loadGraph,
  };
}
