import { performHybridSearch } from './hybridSearchService';
import { scanCodeGraph } from './codeGraphService';
import { detectBreakingChangesInFile } from './breakingChangeDetectorService';
import { generateArchitecturalPlan } from './planEngineService';
import { AutoDevStageResult } from './autoDevTypes';

export async function runAnalysisStages(workspaceRoot: string, taskGoal: string): Promise<{ stages: AutoDevStageResult[]; graphFileCount: number }> {
  const stages: AutoDevStageResult[] = [];

  // Stage 1: Context Indexing
  const t1 = Date.now();
  const adrs = performHybridSearch(workspaceRoot, taskGoal);
  stages.push({
    stageId: 1,
    stageName: 'Context & ADR Indexing',
    toolName: 'Hierarchical Project Memory',
    status: 'success',
    durationMs: Date.now() - t1,
    summary: `Menemukan ${adrs.length} aturan ADR & panduan arsitektur`,
    details: { matched: adrs.map((r) => r.title) },
  });

  // Stage 2: Code Graph Resolution
  const t2 = Date.now();
  const graph = scanCodeGraph(workspaceRoot);
  stages.push({
    stageId: 2,
    stageName: 'AST & Symbol Resolution',
    toolName: 'Code Graph LSP Engine',
    status: 'success',
    durationMs: Date.now() - t2,
    summary: `Memetakan ${graph.totalFiles} modul & ${graph.totalDependencies} relasi impor`,
    details: { totalFiles: graph.totalFiles },
  });

  // Stage 3: Impact Analysis
  const t3 = Date.now();
  const breaking = detectBreakingChangesInFile(workspaceRoot, 'src/modules/ai/logic/useAiChat.ts');
  stages.push({
    stageId: 3,
    stageName: 'Blast Radius Analysis',
    toolName: 'Impact Analyzer',
    status: 'success',
    durationMs: Date.now() - t3,
    summary: `Terdeteksi ${breaking.length} potensi breaking changes`,
    details: { breakingCount: breaking.length },
  });

  // Stage 4: AI Architectural Planning
  const t4 = Date.now();
  const plan = await generateArchitecturalPlan(workspaceRoot, taskGoal);
  stages.push({
    stageId: 4,
    stageName: 'AI Architectural Planning',
    toolName: 'Executive Architecture Planning Engine',
    status: 'success',
    durationMs: Date.now() - t4,
    summary: `Blueprint: ${plan.phases.length} fase eksekusi (Risiko: ${plan.overallRisk.toUpperCase()})`,
    details: { phasesCount: plan.phases.length, risk: plan.overallRisk },
  });

  return { stages, graphFileCount: graph.totalFiles };
}
