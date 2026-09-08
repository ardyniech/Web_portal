import { Router } from 'express';
import { generateArchitecturalPlan } from './planEngineService';

export const planEngineRouter = Router();

planEngineRouter.post('/generate', async (req, res) => {
  try {
    const { taskGoal } = req.body;
    if (!taskGoal) {
      return res.status(400).json({ error: 'Target/tujuan rencana tidak boleh kosong.' });
    }
    const plan = await generateArchitecturalPlan(process.cwd(), taskGoal);
    res.json(plan);
  } catch (err: any) {
    console.error('[Module:PlanEngine] Error generating plan:', err);
    res.status(500).json({ error: err?.message || 'Gagal menyusun rencana eksekusi arsitektur' });
  }
});
