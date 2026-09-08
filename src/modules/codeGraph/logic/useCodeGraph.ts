import { useState, useEffect } from 'react';
import { CodeGraphData, DependencyNode, SymbolReferenceResult, TypeDefinitionResult } from './types';
import { codeGraphApi } from '../storage/codeGraphApi';
import { dispatcher } from '../../../core/dispatcher';

export function useCodeGraph() {
  const [data, setData] = useState<CodeGraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'graph' | 'references' | 'typedef'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [symbolQuery, setSymbolQuery] = useState('dispatcher');
  const [symbolResult, setSymbolResult] = useState<SymbolReferenceResult | null>(null);
  const [typeQuery, setTypeQuery] = useState('CodeGraphData');
  const [typeResult, setTypeResult] = useState<TypeDefinitionResult | null>(null);
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

  const searchReferences = async (sym: string) => {
    if (!sym.trim()) return;
    setLoading(true);
    try {
      const res = await codeGraphApi.findReferences(sym);
      setSymbolResult(res);
    } catch (err: any) {
      setError(err?.message || 'Gagal mencari referensi.');
    } finally {
      setLoading(false);
    }
  };

  const resolveType = async (tgt: string) => {
    if (!tgt.trim()) return;
    setLoading(true);
    try {
      const res = await codeGraphApi.getTypeDefinition(tgt);
      setTypeResult(res);
    } catch (err: any) {
      setError(err?.message || 'Gagal mengekstrak tipe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
    const unsub = dispatcher.on('git:status_updated', () => loadGraph());
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
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    filteredNodes,
    symbolQuery,
    setSymbolQuery,
    symbolResult,
    searchReferences,
    typeQuery,
    setTypeQuery,
    typeResult,
    resolveType,
    refreshGraph: loadGraph,
  };
}
