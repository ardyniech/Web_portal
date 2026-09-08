import { Router } from 'express';
import { performHybridSearch } from './hybridSearchService';
import { getEpicTasks, createEpicTask } from './taskHierarchyService';

export const projectMemoryRouter = Router();

projectMemoryRouter.get('/index', (req, res) => {
  res.json({
    totalRules: 14,
    estimatedTokensSaved: 1850,
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
      {
        id: 'ADR-003',
        title: 'Atomic Sandbox Multi-File Staging',
        status: 'accepted',
        decisionDate: '2026-09-08',
        context: 'Menghindari kerusakan workspace jika terjadi error di tengah multi-file edit.',
        decision: 'Uji perubahan di staging in-memory sebelum di-commit permanen.',
        consequences: ['Zero broken state', 'Rollback instan 1-klik'],
      },
    ],
  });
});

projectMemoryRouter.get('/search', (req, res) => {
  const q = (req.query.q as string) || '';
  const results = performHybridSearch(process.cwd(), q);
  res.json(results);
});

projectMemoryRouter.get('/epics', (req, res) => {
  res.json(getEpicTasks());
});

projectMemoryRouter.post('/epics', (req, res) => {
  const { epicTitle, goal } = req.body;
  const created = createEpicTask(epicTitle || 'Epic Baru', goal || 'Dekomposisi tugas besar');
  res.json(created);
});
