import { ModelSwitcherData } from '../logic/types';

export const modelApi = {
  async fetchStatuses(): Promise<ModelSwitcherData> {
    const res = await fetch('/api/models/status');
    if (!res.ok) throw new Error('Gagal mengambil status model AI');
    return res.json();
  },

  async switchPrimary(modelName: string): Promise<{ success: boolean; activeModel: string }> {
    const res = await fetch('/api/models/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelName }),
    });
    if (!res.ok) throw new Error('Gagal beralih model AI utama');
    return res.json();
  },
};
