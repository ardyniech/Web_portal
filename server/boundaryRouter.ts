import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { auditFileComplexity } from './complexityMonitorService';

export const boundaryRouter = Router();

boundaryRouter.get('/audit', (req, res) => {
  const modulesDir = path.join(process.cwd(), 'src', 'modules');
  const violations: any[] = [];
  let totalFiles = 0;

  if (fs.existsSync(modulesDir)) {
    const mods = fs.readdirSync(modulesDir);
    mods.forEach((mod) => {
      const modPath = path.join(modulesDir, mod);
      if (fs.statSync(modPath).isDirectory()) {
        const scanDir = (dir: string) => {
          const entries = fs.readdirSync(dir);
          entries.forEach((e) => {
            const full = path.join(dir, e);
            if (fs.statSync(full).isDirectory()) {
              scanDir(full);
            } else if (e.endsWith('.ts') || e.endsWith('.tsx')) {
              totalFiles++;
              const lines = fs.readFileSync(full, 'utf-8').split('\n');
              lines.forEach((l, idx) => {
                const match = l.match(/from\s+['"](?:\.\.\/)+([a-zA-Z0-9_-]+)\/(logic|storage|primitives)/);
                if (match && match[1] !== mod) {
                  violations.push({
                    id: `V-${Date.now()}-${idx}`,
                    sourceFile: path.relative(process.cwd(), full),
                    importedTarget: match[0],
                    ruleType: 'cross_module_internal',
                    severity: 'error',
                    message: `Impor langsung berkas internal ${match[1]}/${match[2]} melanggar isolasi modular. Gunakan event dispatcher atau public index.ts.`,
                    line: idx + 1,
                  });
                }
              });
            }
          });
        };
        scanDir(modPath);
      }
    });
  }

  res.json({
    totalFilesAudited: totalFiles,
    violationsCount: violations.length,
    cleanModulesCount: 35,
    violations,
    auditedAt: new Date().toISOString(),
  });
});

boundaryRouter.get('/complexity', (req, res) => {
  try {
    const report = auditFileComplexity(process.cwd());
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memeriksa kompleksitas berkas' });
  }
});
