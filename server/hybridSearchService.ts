import fs from 'fs';
import path from 'path';

export interface HybridSearchResult {
  id: string;
  title: string;
  category: 'feature' | 'symbol' | 'adr' | 'sop' | 'endpoint';
  snippet: string;
  filePath?: string;
  score: number;
}

export function performHybridSearch(workspaceRoot: string, query: string): HybridSearchResult[] {
  const results: HybridSearchResult[] = [];
  if (!query || query.trim().length === 0) return results;

  const q = query.toLowerCase();
  const adrs = [
    { title: 'Universal Modular Cellular Architecture', cat: 'adr', snip: 'Komunikasi antar modul HANYA melalui core/dispatcher event bus.' },
    { title: 'Strict File Size Limit (< 125 Lines)', cat: 'adr', snip: 'Setiap berkas dibatasi maksimal 125 baris kode untuk mencegah monolit.' },
    { title: 'Atomic Transaction Staging', cat: 'adr', snip: 'Sandbox in-memory rollback otomatis bila ada galat linting.' },
    { title: 'PR Pre-Flight Audit & Auto-Fixer', cat: 'sop', snip: 'Verifikasi keamanan dan arsitektur sebelum remote git push.' },
  ];

  adrs.forEach((a, i) => {
    if (a.title.toLowerCase().includes(q) || a.snip.toLowerCase().includes(q)) {
      results.push({
        id: `adr-${i}`,
        title: a.title,
        category: a.cat as any,
        snippet: a.snip,
        score: 0.95,
      });
    }
  });

  // Search module directories
  const modulesDir = path.join(workspaceRoot, 'src', 'modules');
  if (fs.existsSync(modulesDir)) {
    const mods = fs.readdirSync(modulesDir);
    mods.forEach((m) => {
      if (m.toLowerCase().includes(q)) {
        results.push({
          id: `mod-${m}`,
          title: `Modul: ${m}`,
          category: 'feature',
          snippet: `Modul fitur seluler mandiri di src/modules/${m}`,
          filePath: `src/modules/${m}/index.ts`,
          score: 0.9,
        });
      }
    });
  }

  return results;
}
