import { Router } from 'express';
import { scanCodeGraph } from './codeGraphService';
import { detectBreakingChangesInFile } from './breakingChangeDetectorService';

export const blastRadiusRouter = Router();

blastRadiusRouter.get('/workspace', (req, res) => {
  try {
    const graph = scanCodeGraph(process.cwd());
    const results = graph.nodes.map((node) => {
      const breakingIssues = detectBreakingChangesInFile(process.cwd(), `${node.filePath}/index.ts`);
      const blastScore = Math.min(100, node.dependents.length * 20 + Math.floor(node.lineCount / 40) + breakingIssues.length * 15);
      const isCritical = node.dependents.length >= 4 || blastScore >= 70;
      const isHigh = node.dependents.length >= 2 || blastScore >= 40;

      return {
        targetFile: node.filePath,
        linesChanged: node.lineCount,
        totalAffectedModules: node.dependents.length,
        overallRisk: isCritical ? 'critical' : isHigh ? 'high' : 'low',
        blastScore,
        suggestStagedMigration: node.dependents.length >= 2 || breakingIssues.length > 0,
        stagedSteps: [
          `Fase 1: Buat antarmuka adapter kompatibilitas baru di ${node.filePath}/index.ts`,
          `Fase 2: Migrasikan modul konsumen (${node.dependents.join(', ') || 'tidak ada'}) satu per satu`,
          `Fase 3: Validasi lint dan type-check lint_applet`,
          `Fase 4: Hapus kode legacy yang telah didegradasi`,
        ],
        affectedModules: node.dependents.map((d) => ({
          moduleId: d,
          moduleName: d,
          impactReason: `Mengonsumsi publik interface dari ${node.name}`,
          riskLevel: isCritical ? 'critical' : 'high',
          directDependent: true,
        })),
        potentialBreakingChanges: breakingIssues.map((b) => `[${b.severity.toUpperCase()}] ${b.symbolName}: ${b.description}`),
        analyzedAt: new Date().toISOString(),
      };
    });

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
