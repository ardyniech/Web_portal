import { Router } from 'express';
import { runTargetedModuleTests } from './targetedRunnerService';

interface StagedTx {
  id: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'tested' | 'committed' | 'rolled_back';
  files: { filePath: string; stagedContent: string; linesDelta: number }[];
  testPassed: boolean;
  typeCheckPassed: boolean;
}

const memoryStagingPool: StagedTx[] = [
  {
    id: 'TX-SANDBOX-01',
    description: 'In-Memory Staging: Large Project Engine Verification',
    createdAt: new Date().toISOString(),
    status: 'tested',
    files: [
      { filePath: 'src/modules/codeGraph/index.ts', stagedContent: '// verified ast graph export', linesDelta: 4 },
      { filePath: 'src/modules/blastRadius/index.ts', stagedContent: '// verified blast radius export', linesDelta: 4 },
    ],
    testPassed: true,
    typeCheckPassed: true,
  },
];

export const stagingRouter = Router();

stagingRouter.get('/transactions', (req, res) => {
  res.json(memoryStagingPool);
});

stagingRouter.post('/targeted-tests', (req, res) => {
  const { modules } = req.body;
  const targetMods = Array.isArray(modules) && modules.length > 0 ? modules : ['codeGraph', 'blastRadius', 'projectMemory'];
  const suite = runTargetedModuleTests(process.cwd(), targetMods);
  res.json(suite);
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
