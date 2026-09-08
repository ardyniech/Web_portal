import { Router } from 'express';
import { scanCodeGraph } from './codeGraphService';

export const codeGraphRouter = Router();

codeGraphRouter.get('/graph', (req, res) => {
  try {
    const graph = scanCodeGraph(process.cwd());
    res.json({
      ...graph,
      symbols: [],
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memindai code graph' });
  }
});
