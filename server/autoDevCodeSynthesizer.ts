import { generateAiContentWithFallback } from './geminiService';
import { verifyAndSelfCorrectProposal } from './autoDevSelfCorrectionService';
import { scanRepoLanguageFingerprint } from './languageSupportService';
import { analyzeDeepRepoContext } from './deepRepoAnalyzerService';
import { AutoDevPipelineRun } from './autoDevTypes';

export async function synthesizeAiCodeProposal(workspaceRoot: string, taskGoal: string, totalFiles: number): Promise<AutoDevPipelineRun['aiCodeProposal']> {
  try {
    const fingerprint = scanRepoLanguageFingerprint(workspaceRoot);
    const deepRepo = analyzeDeepRepoContext(workspaceRoot);

    const aiPrompt = `Instruksi Pengguna: "${taskGoal}".
${deepRepo.formattedSummary}
Distribusi Bahasa Repositori: ${fingerprint.breakdownText}.

PENTING - PEMBANGUNAN MENDALAM & MULTI-BERKAS:
Jangan membatasi diri hanya pada 1 atau 2 berkas!
Berdasarkan permintaan pengguna, hasilkan modul produksi yang LENGKAP dengan arsitektur seluler multi-layer (biasanya 3 hingga 8 berkas):
1. UI Primitives (\`src/modules/<feature>/primitives/\`)
2. Logic / State Hook (\`src/modules/<feature>/logic/\`)
3. Storage / API Adapter (\`src/modules/<feature>/storage/\`)
4. Public API Exports (\`src/modules/<feature>/index.ts\`)
5. Server Express Router / Service (bila memerlukan backend di \`server/\`)
6. Dokumentasi Ringkas & Integrasi Modul Baru

SOP ATURAN:
- Setiap berkas WAJIB di bawah 125 baris.
- Tulis kode produksi murni tanpa placeholder, TODO, atau mock buatan.

Kirimkan HANYA dalam format JSON valid:
{
  "summary": "Analisis mendalam & ringkasan arsitektur solusi",
  "commitMessage": "feat(auto-dev): deskripsi lengkap perubahan",
  "targets": [
    {
      "filePath": "src/modules/namaFitur/primitives/NamaFiturModal.tsx",
      "action": "create",
      "description": "Komponen UI murni",
      "codeSnippet": "// Kode produksi murni..."
    }
  ]
}`;

    const systemPrompt = `You are a World-Class Polyglot Lead Principal Architect. You deeply analyze existing repository structures and generate full multi-layer features (3-8 complete files) matching cellular architecture guidelines (<125 lines/file, production-grade, zero placeholders).`;

    const aiRes = await generateAiContentWithFallback(aiPrompt, systemPrompt);
    const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const targets = parsed.targets || [];
      const { correctedTargets, autoFixesApplied } = await verifyAndSelfCorrectProposal(targets);

      return {
        summary: `${parsed.summary} [Deep Repo Analysis: ${deepRepo.moduleNames.length} Modul Teranalisa]` + (autoFixesApplied > 0 ? ` (${autoFixesApplied} Self-Fix Applied)` : ''),
        commitMessage: parsed.commitMessage || `feat(auto-dev): ${taskGoal}`,
        targets: correctedTargets,
      };
    }
  } catch (err) {
    console.warn('[Module:AutoDev] Deep Polyglot AI Code Gen fallback:', err);
  }
  return undefined;
}
