import { scanCodeGraph } from './codeGraphService';
import { performHybridSearch } from './hybridSearchService';
import { generateAiContentWithFallback } from './geminiService';
import { PlanPhase, ArchitecturalPlanBlueprint } from './planEngineTypes';

export async function generateArchitecturalPlan(workspaceRoot: string, taskGoal: string): Promise<ArchitecturalPlanBlueprint> {
  const planId = `PLAN-${Date.now().toString(36).toUpperCase()}`;
  const graph = scanCodeGraph(workspaceRoot);
  const relevantADRs = performHybridSearch(workspaceRoot, taskGoal);

  const prompt = `Buatkan Rencana Eksekusi Arsitektur (Architectural Plan Blueprint) yang rapi & terstruktur untuk target: "${taskGoal}".
Sediakan rincian fase terstruktur, batasan keamanan, analisis risiko, dan kriteria validasi penerimaan.
Formatkan dalam JSON valid:
{
  "strategicSummary": "ringkasan strategi teknis",
  "overallRisk": "medium",
  "phases": [
    {
      "phaseId": 1,
      "title": "Nama Fase",
      "objective": "Tujuan spesifik",
      "riskLevel": "low",
      "prerequisites": ["prarat 1"],
      "targetFiles": [{"filePath": "src/path.ts", "action": "edit", "description": "detail"}],
      "validationCriteria": ["kriteria 1"],
      "estimatedTimeMinutes": 5,
      "estimatedTokens": 450
    }
  ]
}`;

  let aiPlan: Partial<ArchitecturalPlanBlueprint> = {};
  try {
    const aiRes = await generateAiContentWithFallback(prompt, 'You are a Chief Software Architect generating JSON plans.');
    const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) aiPlan = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn('[Module:PlanEngine] AI generation fallback to deterministic plan engine');
  }

  const defaultPhases: PlanPhase[] = [
    {
      phaseId: 1,
      title: 'Fase 1: Isolasi & Pemetaan Struktur Data',
      objective: 'Mendefinisikan tipe TypeScript murni & kontrak API tanpa efek samping.',
      riskLevel: 'low',
      prerequisites: ['Inisialisasi konteks memori proyek & aturan ADR'],
      targetFiles: [{ filePath: 'src/modules/feature/logic/types.ts', action: 'create', description: 'Definisi antarmuka & payload' }],
      validationCriteria: ['`tsc --noEmit` lulus tanpa error', 'Jumlah baris <125'],
      estimatedTimeMinutes: 3,
      estimatedTokens: 350,
    },
    {
      phaseId: 2,
      title: 'Fase 2: Implementasi Logika Murni & Adapter',
      objective: 'Membuat modul logika murni dan storage adapter yang terisolasi.',
      riskLevel: 'medium',
      prerequisites: ['Fase 1 Selesai'],
      targetFiles: [
        { filePath: 'src/modules/feature/storage/featureApi.ts', action: 'create', description: 'Klien API backend' },
        { filePath: 'src/modules/feature/logic/useFeature.ts', action: 'create', description: 'React custom hook' },
      ],
      validationCriteria: ['Log format `[Module:X] Error in Y: Z` dipatuhi'],
      estimatedTimeMinutes: 6,
      estimatedTokens: 750,
    },
    {
      phaseId: 3,
      title: 'Fase 3: Konstruksi UI Primitives & Registrasi Dispatcher',
      objective: 'Menyusun komponen visual ergonomis & meregistrasikan modul di loader.',
      riskLevel: 'low',
      prerequisites: ['Fase 2 Selesai'],
      targetFiles: [{ filePath: 'src/modules/feature/primitives/FeatureModal.tsx', action: 'create', description: 'UI Modal ergonomis' }],
      validationCriteria: ['`compile_applet` build sukses', 'Komunikasi antar modul via `core/dispatcher`'],
      estimatedTimeMinutes: 5,
      estimatedTokens: 600,
    },
  ];

  const phases: PlanPhase[] = aiPlan.phases && aiPlan.phases.length > 0 ? (aiPlan.phases as PlanPhase[]) : defaultPhases;

  return {
    planId,
    goalTitle: taskGoal,
    createdAt: new Date().toISOString(),
    strategicSummary: aiPlan.strategicSummary || `Rencana eksekusi arsitektur terstruktur untuk "${taskGoal}" dengan 3 fase aman terisolasi.`,
    overallRisk: (aiPlan.overallRisk as any) || 'medium',
    phases,
    safetyGuardrails: {
      maxLinesLimit: 125,
      cellularIsolations: ['Modul hanya mengimpor `shared/` & meregistrasikan public API via `index.ts`'],
      rollbackCheckpoint: `git-checkpoint-${Date.now().toString(36)}`,
    },
    totalEstimatedTokens: phases.reduce((acc, p) => acc + (p.estimatedTokens || 500), 0),
    estimatedTotalMinutes: phases.reduce((acc, p) => acc + (p.estimatedTimeMinutes || 5), 0),
  };
}
