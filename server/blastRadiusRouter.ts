import { Router } from 'express';
import { scanCodeGraph } from './codeGraphService';

export const blastRadiusRouter = Router();

blastRadiusRouter.get('/workspace', (req, res) => {
  try {
    const graph = scanCodeGraph(process.cwd());
    const results = graph.nodes.map((node) => ({
      targetFile: node.filePath,
      linesChanged: node.lineCount,
      totalAffectedModules: node.dependents.length,
      overallRisk: node.dependents.length > 3 ? 'critical' : node.dependents.length > 1 ? 'high' : 'low',
      blastScore: Math.min(100, node.dependents.length * 25 + Math.floor(node.lineCount / 50)),
      suggestStagedMigration: node.dependents.length >= 2,
      affectedModules: node.dependents.map((d) => ({
        moduleId: d,
        moduleName: d,
        impactReason: `Mengonsumsi publik interface dari ${node.name}`,
        riskLevel: 'high',
        directDependent: true,
      })),
      potentialBreakingChanges: [],
      analyzedAt: new Date().toISOString(),
    }));

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
