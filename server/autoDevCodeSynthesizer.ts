import { generateAiContentWithFallback } from './geminiService';
import { verifyAndSelfCorrectProposal } from './autoDevSelfCorrectionService';
import { scanRepoLanguageFingerprint } from './languageSupportService';
import { AutoDevPipelineRun } from './autoDevTypes';

export async function synthesizeAiCodeProposal(workspaceRoot: string, taskGoal: string, totalFiles: number): Promise<AutoDevPipelineRun['aiCodeProposal']> {
  try {
    const fingerprint = scanRepoLanguageFingerprint(workspaceRoot);
    const aiPrompt = `Instruksi Pengguna: "${taskGoal}".
Distribusi Bahasa Repositori: ${fingerprint.breakdownText}.

Dukung pembuatan atau modifikasi kode dalam BAHASA PEMROGRAMAN MANAPUN (TypeScript, Python, Rust, Go, Java, C/C++, C#, PHP, Ruby, Swift, Dart, Elixir, Haskell, Vue, Svelte, Solidity, Shell, SQL, YAML, dll).
Terapkan idiom & konvensi terbaik khas bahasa target (misal: PEP8 untuk Python, Borrowing/Ownership untuk Rust, Goroutines untuk Go, Sound Null Safety untuk Dart/Kotlin, Strict Types untuk TS/PHP).

Berdasarkan konteks arsitektur (${totalFiles} berkas), buatkan proposal kode produksi yang konkret dan idiomatik.
Kirimkan HANYA dalam format JSON valid:
{
  "summary": "Ringkasan solusi teknis",
  "commitMessage": "feat(auto-dev): deskripsi perubahan",
  "targets": [
    {
      "filePath": "path/ke/berkas.ext",
      "action": "create",
      "description": "Deskripsi perubahan, bahasa, dan pola idiomatik yang diterapkan",
      "codeSnippet": "// Kode murni produksi idiomatik..."
    }
  ]
}`;

    const systemPrompt = `You are a World-Class Polyglot Principal Software Architect with expert-level mastery in 30+ programming languages (TypeScript, Python, Rust, Go, C++, Java, Kotlin, Swift, Dart, Elixir, PHP, Ruby, Haskell, Solidity, SQL, Docker, etc.). You strictly write idiomatic, production-grade, bug-free code matching the repository's language style.`;

    const aiRes = await generateAiContentWithFallback(aiPrompt, systemPrompt);
    const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const targets = parsed.targets || [];
      const { correctedTargets, autoFixesApplied } = await verifyAndSelfCorrectProposal(targets);

      return {
        summary: `${parsed.summary} [Repo: ${fingerprint.topLanguages.slice(0, 3).join('/') || 'Polyglot'}]` + (autoFixesApplied > 0 ? ` (${autoFixesApplied} Self-Fix Applied)` : ''),
        commitMessage: parsed.commitMessage || `feat(auto-dev): ${taskGoal}`,
        targets: correctedTargets,
      };
    }
  } catch (err) {
    console.warn('[Module:AutoDev] Polyglot AI Code Gen fallback:', err);
  }
  return undefined;
}
