import { ProjectContextIndex, HybridSearchResult, EpicTask } from '../logic/types';

export const projectMemoryApi = {
  async fetchIndex(): Promise<ProjectContextIndex> {
    const res = await fetch('/api/memory/index');
    if (!res.ok) throw new Error('Gagal memuat indeks arsitektur proyek');
    return res.json();
  },

  async searchMemory(query: string): Promise<HybridSearchResult[]> {
    const res = await fetch(`/api/memory/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Gagal melakukan pencarian hybrid');
    return res.json();
  },

  async fetchEpics(): Promise<EpicTask[]> {
    const res = await fetch('/api/memory/epics');
    if (!res.ok) throw new Error('Gagal memuat daftar epics');
    return res.json();
  },

  async createEpic(epicTitle: string, goal: string): Promise<EpicTask> {
    const res = await fetch('/api/memory/epics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ epicTitle, goal }),
    });
    if (!res.ok) throw new Error('Gagal membuat epic baru');
    return res.json();
  },
};
