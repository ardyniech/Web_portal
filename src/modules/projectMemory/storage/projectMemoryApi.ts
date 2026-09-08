import { ProjectContextIndex } from '../logic/types';

export const projectMemoryApi = {
  async fetchContextIndex(): Promise<ProjectContextIndex> {
    const res = await fetch('/api/projectmemory/index');
    if (!res.ok) {
      throw new Error('Gagal mengambil indeks konteks proyek');
    }
    return res.json();
  },
};
