import { Router } from 'express';
import { getModelStatuses, getSwitchLogs, setPrimaryModel } from './modelSwitcherService';

export const modelSwitcherRouter = Router();

modelSwitcherRouter.get('/status', (req, res) => {
  res.json({
    models: getModelStatuses(),
    switchLogs: getSwitchLogs(),
  });
});

modelSwitcherRouter.post('/switch', (req, res) => {
  try {
    const { modelName } = req.body;
    if (!modelName) return res.status(400).json({ error: 'modelName wajib diisi' });
    setPrimaryModel(modelName);
    res.json({ success: true, activeModel: modelName });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gagal mengubah model utama' });
  }
});
