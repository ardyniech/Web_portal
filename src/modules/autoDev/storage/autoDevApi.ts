import { AutoDevPipelineRun, CodeProposalTarget } from '../logic/types';

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

  async applyProposal(targets: CodeProposalTarget[]): Promise<{ success: boolean; appliedFiles: string[] }> {
    const res = await fetch('/api/autodev/apply-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targets }),
    });
    if (!res.ok) throw new Error('Gagal menerapkan usulan kode ke berkas');
    return res.json();
  },

  async rollback(commitHash?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/autodev/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commitHash }),
    });
    if (!res.ok) throw new Error('Gagal melakukan rollback');
    return res.json();
  },
};
