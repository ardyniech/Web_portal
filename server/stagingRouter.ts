import { Router } from 'express';

interface StagedTx {
  id: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'tested' | 'committed' | 'rolled_back';
  files: { filePath: string; stagedContent: string; linesDelta: number }[];
  testPassed: boolean;
  typeCheckPassed: boolean;
}

const memoryStagingPool: StagedTx[] = [];

export const stagingRouter = Router();

stagingRouter.get('/transactions', (req, res) => {
  res.json(memoryStagingPool);
});

stagingRouter.post('/commit', (req, res) => {
  const { transactionId } = req.body;
  const idx = memoryStagingPool.findIndex((t) => t.id === transactionId);
  if (idx !== -1) {
    memoryStagingPool[idx].status = 'committed';
  }
  res.json({ success: true, commitHash: 'tx-' + Date.now().toString(16) });
});

stagingRouter.post('/rollback', (req, res) => {
  const { transactionId } = req.body;
  const idx = memoryStagingPool.findIndex((t) => t.id === transactionId);
  if (idx !== -1) {
    memoryStagingPool.splice(idx, 1);
  }
  res.json({ success: true });
});
