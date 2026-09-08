import { Router } from 'express';
import { scanCodeGraph } from './codeGraphService';
import { findSymbolReferences } from './symbolReferenceService';
import { extractTypeDefinition } from './typeDefinitionService';

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

codeGraphRouter.get('/references', (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || '';
    const result = findSymbolReferences(process.cwd(), symbol);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mencari referensi simbol' });
  }
});

codeGraphRouter.get('/type-definition', (req, res) => {
  try {
    const target = (req.query.target as string) || '';
    const result = extractTypeDefinition(process.cwd(), target);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengekstrak definisi tipe' });
  }
});
