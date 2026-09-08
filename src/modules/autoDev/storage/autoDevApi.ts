import { AutoDevPipelineRun } from '../logic/types';

export const autoDevApi = {
  async runPipeline(taskGoal: string): Promise<AutoDevPipelineRun> {
    const res = await fetch('/api/autodev/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskGoal }),
    });
    if (!res.ok) throw new Error('Gagal mengeksekusi Auto Dev Pipeline');
    return res.json();
  },

  async fetchHistory(): Promise<AutoDevPipelineRun[]> {
    const res = await fetch('/api/autodev/history');
    if (!res.ok) throw new Error('Gagal mengambil riwayat Auto Dev');
    return res.json();
  },
};
