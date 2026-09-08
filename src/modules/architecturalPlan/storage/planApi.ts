import { ArchitecturalPlanBlueprint } from '../logic/types';

export const planApi = {
  async generatePlan(taskGoal: string): Promise<ArchitecturalPlanBlueprint> {
    const res = await fetch('/api/plan/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskGoal }),
    });
    if (!res.ok) throw new Error('Gagal menyusun rencana arsitektur proyek');
    return res.json();
  },
};
