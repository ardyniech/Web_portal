import { BlastRadiusResult } from '../logic/types';

export const blastRadiusApi = {
  async analyzeFile(filePath: string): Promise<BlastRadiusResult> {
    const res = await fetch('/api/blastradius/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    });
    if (!res.ok) {
      throw new Error('Gagal menganalisis blast radius berkas');
    }
    return res.json();
  },

  async getRecentWorkspaceBlast(): Promise<BlastRadiusResult[]> {
    const res = await fetch('/api/blastradius/workspace');
    if (!res.ok) {
      throw new Error('Gagal mengambil blast radius workspace');
    }
    return res.json();
  },
};
