import { CodeGraphData, DependencyNode, SymbolReference } from '../logic/types';

export const codeGraphApi = {
  async fetchGraph(): Promise<CodeGraphData> {
    const res = await fetch('/api/codegraph/graph');
    if (!res.ok) {
      throw new Error('Gagal mengambil Code Graph dependensi');
    }
    return res.json();
  },

  async searchSymbols(query: string): Promise<SymbolReference[]> {
    const res = await fetch(`/api/codegraph/symbols?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error('Gagal mencari referensi simbol');
    }
    return res.json();
  },
};
