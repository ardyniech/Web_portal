import { Router } from 'express';
import { executeAutoDevPipeline } from './autoDevService';
import { AutoDevPipelineRun } from './autoDevTypes';
import { applyCodeProposalToWorkspace } from './proposalApplierService';

export const autoDevRouter = Router();

const historyRuns: AutoDevPipelineRun[] = [];

autoDevRouter.get('/history', (req, res) => {
  res.json(historyRuns);
});

autoDevRouter.post('/run', async (req, res) => {
  try {
    const { taskGoal } = req.body;
    const goal = taskGoal || 'Autonomous Full-Stack Feature Execution & Verification';
    const result = await executeAutoDevPipeline(process.cwd(), goal);
    historyRuns.unshift(result);
    if (historyRuns.length > 20) historyRuns.pop();
    res.json(result);
  } catch (err: any) {
    console.error('[Module:AutoDev] Error in pipeline:', err);
    res.status(500).json({ error: err?.message || 'Gagal menjalankan Auto Dev Pipeline' });
  }
});

autoDevRouter.post('/apply-proposal', (req, res) => {
  try {
    const { targets } = req.body;
    if (!Array.isArray(targets)) {
      return res.status(400).json({ error: 'Targets array required' });
    }
    const result = applyCodeProposalToWorkspace(process.cwd(), targets);
    res.json(result);
  } catch (err: any) {
    console.error('[Module:AutoDev] Error applying proposal:', err);
    res.status(500).json({ error: err?.message || 'Gagal menerapkan kode ke repositori' });
  }
});
