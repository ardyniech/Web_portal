import { generateAiContentWithFallback } from './geminiService';
import { verifyAndSelfCorrectProposal } from './autoDevSelfCorrectionService';
import { AutoDevPipelineRun } from './autoDevTypes';

export async function synthesizeAiCodeProposal(workspaceRoot: string, taskGoal: string, totalFiles: number): Promise<AutoDevPipelineRun['aiCodeProposal']> {
  try {
    const aiPrompt = `Pengguna memberikan instruksi umum berikut untuk proyek ini: "${taskGoal}".
Berdasarkan konteks arsitektur (${totalFiles} berkas), buatkan proposal kode produksi yang konkret dan siap diimplementasikan.
Kirimkan dalam format JSON valid:
{
  "summary": "Ringkasan teknis solusi untuk instruksi pengguna",
  "commitMessage": "feat(auto-dev): deskripsi perubahan",
  "targets": [
    {
      "filePath": "src/modules/feature/logic/types.ts",
      "action": "create",
      "description": "Deskripsi perubahan",
      "codeSnippet": "// Kode TypeScript/React produksi..."
    }
  ]
}`;
    const aiRes = await generateAiContentWithFallback(aiPrompt, 'You are an elite Senior Principal Engineer. Generate production JSON proposals for user prompts.');
    const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const targets = parsed.targets || [];
      const { correctedTargets, autoFixesApplied } = await verifyAndSelfCorrectProposal(targets);

      return {
        summary: parsed.summary + (autoFixesApplied > 0 ? ` (${autoFixesApplied} Perbaikan Sintaks Otomatis)` : ''),
        commitMessage: parsed.commitMessage || `feat(auto-dev): ${taskGoal}`,
        targets: correctedTargets,
      };
    }
  } catch (err) {
    console.warn('[Module:AutoDev] Dynamic AI Code Gen fallback:', err);
  }
  return undefined;
}
