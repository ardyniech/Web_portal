import { generateAiContentWithFallback } from './geminiService';
import { verifyAndSelfCorrectProposal } from './autoDevSelfCorrectionService';
import { AutoDevPipelineRun } from './autoDevTypes';

export async function synthesizeAiCodeProposal(workspaceRoot: string, taskGoal: string, totalFiles: number): Promise<AutoDevPipelineRun['aiCodeProposal']> {
  try {
    const aiPrompt = `Pengguna memberikan instruksi umum/spesifik berikut untuk proyek ini: "${taskGoal}".
Dukung pembuatan atau modifikasi kode dalam BAHASA PEMROGRAMAN APA PUN yang diminta atau sesuai konteks proyek (TypeScript, JavaScript, Python, Rust, Go, Java, Kotlin, C/C++, C#, PHP, Ruby, Swift, Dart, Shell, SQL, HTML/CSS, JSON/YAML).

Berdasarkan konteks arsitektur (${totalFiles} berkas), buatkan proposal kode produksi yang konkret dan siap diimplementasikan.
Kirimkan dalam format JSON valid:
{
  "summary": "Ringkasan teknis solusi untuk instruksi pengguna",
  "commitMessage": "feat(auto-dev): deskripsi perubahan",
  "targets": [
    {
      "filePath": "path/ke/berkas.ext",
      "action": "create",
      "description": "Deskripsi perubahan dan bahasa yang digunakan",
      "codeSnippet": "// Kode murni produksi dalam bahasa yang sesuai..."
    }
  ]
}`;
    const aiRes = await generateAiContentWithFallback(
      aiPrompt,
      'You are an elite Polyglot Senior Principal Engineer fluent in TypeScript, Python, Rust, Go, Java, C++, PHP, SQL, Shell, etc. Generate production JSON proposals.'
    );
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
    console.warn('[Module:AutoDev] Dynamic AI Polyglot Code Gen fallback:', err);
  }
  return undefined;
}
