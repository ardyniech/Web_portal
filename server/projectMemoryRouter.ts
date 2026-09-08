import { Router } from 'express';

export const projectMemoryRouter = Router();

projectMemoryRouter.get('/index', (req, res) => {
  res.json({
    totalRules: 12,
    estimatedTokensSaved: 1450,
    adrs: [
      {
        id: 'ADR-001',
        title: 'Universal Modular Cellular Architecture',
        status: 'accepted',
        decisionDate: '2026-09-08',
        context: 'Perlu isolasi modul ketat agar tidak saling mengunci dalam skala besar.',
        decision: 'Komunikasi antar modul HANYA melalui core/dispatcher event bus.',
        consequences: ['Isolasi bersih', 'Tidak ada circular deadlock', 'Mudah ditest'],
      },
      {
        id: 'ADR-002',
        title: 'Strict File Size Limit (< 125 Lines)',
        status: 'accepted',
        decisionDate: '2026-09-08',
        context: 'Berkas monolitik memicu halusinasi dan token overflow pada AI agent.',
        decision: 'Setiap berkas dibatasi maksimal 125 baris kode.',
        consequences: ['Dekomposisi cepat', 'Fokus fungsi tunggal'],
      },
    ],
    conventions: [],
  });
});
