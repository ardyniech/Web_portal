import { CodeGraphData, SymbolReferenceResult, TypeDefinitionResult } from '../logic/types';

export const codeGraphApi = {
  async fetchGraph(): Promise<CodeGraphData> {
    const res = await fetch('/api/codegraph/graph');
    if (!res.ok) throw new Error('Gagal mengambil Code Graph dependensi');
    return res.json();
  },

  async findReferences(symbol: string): Promise<SymbolReferenceResult> {
    const res = await fetch(`/api/codegraph/references?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error('Gagal mencari referensi simbol');
    return res.json();
  },

  async getTypeDefinition(target: string): Promise<TypeDefinitionResult> {
    const res = await fetch(`/api/codegraph/type-definition?target=${encodeURIComponent(target)}`);
    if (!res.ok) throw new Error('Gagal mengambil definisi tipe');
    return res.json();
  },
};
