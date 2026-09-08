import { generateAiContentWithFallback } from './geminiService';
import { RefactorAiResult, RefactorFileChange } from './refactorAiTypes';
import { generateDeterministicRefactor } from './refactorDeterministic';
import { validateAstSyntax } from './refactorValidator';

export type { RefactorAiResult, RefactorFileChange };

function cleanAiOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

export async function analyzeAndRefactorCode(
  filePath: string,
  originalCode: string,
  goal: string,
  commitContext?: string
): Promise<RefactorAiResult> {
  const prompt = `Anda adalah Senior Lead Software Architect & Code Auditor. Refactor kode berikut secara NYATA dan PRODUCTION-GRADE tanpa gimmick:
Berkas: ${filePath}
Tujuan Refaktor: ${goal}
Konteks Commit: ${commitContext || 'Peningkatan arsitektur & kepatuhan SOP'}

Aturan Wajib (SOP):
1. Hasil refaktor HARUS kode lengkap, siap dijalankan, tanpa "...rest of code" atau "TODO".
2. Panjang baris file hasil refaktor diusahakan <125 baris. Jika file terlalu panjang (>110 baris) atau tujuan dekomposisi dipilih, pecah kode menjadi berkas utama dan sub-komponen/helper baru di "fileChanges".
3. Hindari penggunaan tipe 'any' tanpa type guard atau interface yang jelas.
4. Tangani error dengan try/catch terstandar: console.error('[Module:<Nama>] Error in <fungsi>: <pesan>').
5. Pertahankan API/ekspor fungsional yang sudah ada agar tidak memecah modul lain.

KEMBALIKAN HANYA JSON VALID BERIKUT (tanpa markdown tambahan):
{
  "title": "Judul refaktor ringkas",
  "summary": "Penjelasan ringkas bahasa Indonesia apa yang diperbaiki",
  "appliedRules": ["Daftar 2-4 aturan SOP yang diterapkan"],
  "refactoredCode": "Kode berkas utama hasil refaktor lengkap",
  "reason": "Alasan perubahan teknis spesifik",
  "fileChanges": [
    {
      "filePath": "${filePath}",
      "refactoredCode": "Kode lengkap berkas utama",
      "reason": "Refaktor berkas utama",
      "action": "modify"
    }
  ],
  "dependencyUpdates": []
}

KODE ASLI BERKAS:
\`\`\`typescript
${originalCode}
\`\`\``;

  try {
    const aiRes = await generateAiContentWithFallback(prompt, 'You are an elite code refactoring and architecture engine.');
    const jsonStr = cleanAiOutput(aiRes.text);
    const parsed = JSON.parse(jsonStr);
    if (parsed.refactoredCode) {
      const fileChanges: RefactorFileChange[] = Array.isArray(parsed.fileChanges) && parsed.fileChanges.length > 0
        ? parsed.fileChanges
        : [{ filePath, refactoredCode: parsed.refactoredCode, reason: parsed.reason || 'Pembaruan berkas', action: 'modify' }];

      // Run AST Validation on each file
      for (const fc of fileChanges) {
        fc.originalCode = fc.filePath === filePath ? originalCode : '';
        fc.validation = validateAstSyntax(fc.filePath, fc.refactoredCode);
      }

      return {
        title: parsed.title || `Refaktor AI: ${filePath.split('/').pop()}`,
        summary: parsed.summary || 'Pembaruan struktur kode berbasis AI.',
        appliedRules: Array.isArray(parsed.appliedRules) ? parsed.appliedRules : ['SOP Refactoring'],
        refactoredCode: parsed.refactoredCode,
        reason: parsed.reason || 'Peningkatan kualitas dan keandalan kode.',
        dependencyUpdates: Array.isArray(parsed.dependencyUpdates) ? parsed.dependencyUpdates : [],
        fileChanges,
      };
    }
  } catch (err: any) {
    console.warn('[Module:RefactorAi] Gemini parse/fetch failed, applying deterministic refactor:', err?.message);
  }

  return generateDeterministicRefactor(filePath, originalCode, goal);
}
