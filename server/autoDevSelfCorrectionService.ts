import { generateAiContentWithFallback } from './geminiService';
import { CodeProposalTarget } from './autoDevTypes';
import { detectLanguageByFilePath } from './languageSupportService';

export async function verifyAndSelfCorrectProposal(targets: CodeProposalTarget[]): Promise<{ correctedTargets: CodeProposalTarget[]; autoFixesApplied: number }> {
  let autoFixesApplied = 0;
  const correctedTargets: CodeProposalTarget[] = [];

  for (const tgt of targets) {
    if (!tgt.codeSnippet) {
      correctedTargets.push(tgt);
      continue;
    }

    const langInfo = detectLanguageByFilePath(tgt.filePath);
    const code = tgt.codeSnippet;
    let needsFixing = false;
    let reason = '';

    // Polyglot Syntax Health Checks
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces && ['typescript', 'javascript', 'rust', 'go', 'java', 'kotlin', 'cpp', 'csharp', 'php', 'dart', 'web'].includes(langInfo.id)) {
      needsFixing = true;
      reason = 'Tanda kurung kurawal ({}) tidak seimbang';
    }

    if (langInfo.id === 'python' && code.includes('def ') && !code.includes(':')) {
      needsFixing = true;
      reason = 'Definisi fungsi Python tidak memiliki titik dua (:)';
    }

    if (langInfo.id === 'json') {
      try {
        JSON.parse(code);
      } catch {
        needsFixing = true;
        reason = 'Sintaks JSON tidak valid';
      }
    }

    if (needsFixing) {
      autoFixesApplied++;
      try {
        const fixPrompt = `Perbaiki sintaks kode bahasa ${langInfo.name} berikut (${reason}):\n\n\`\`\`${langInfo.codeTag}\n${code}\n\`\`\`\n\nKirimkan HANYA kode ${langInfo.name} murni tanpa markdown.`;
        const fixed = await generateAiContentWithFallback(fixPrompt, `You are an expert ${langInfo.name} linter and compiler. Fix syntax errors.`);
        const cleanCode = fixed.text.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
        correctedTargets.push({ ...tgt, codeSnippet: cleanCode, description: `${tgt.description} (Autocorrected ${langInfo.name} Syntax)` });
        continue;
      } catch (err) {
        console.warn(`[AutoDev:PolyglotSelfCorrection] Fix failed for ${langInfo.name}:`, err);
      }
    }

    correctedTargets.push(tgt);
  }

  return { correctedTargets, autoFixesApplied };
}
