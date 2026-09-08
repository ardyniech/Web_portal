import { generateAiContentWithFallback } from './geminiService';
import { CodeProposalTarget } from './autoDevTypes';

export async function verifyAndSelfCorrectProposal(targets: CodeProposalTarget[]): Promise<{ correctedTargets: CodeProposalTarget[]; autoFixesApplied: number }> {
  let autoFixesApplied = 0;
  const correctedTargets: CodeProposalTarget[] = [];

  for (const tgt of targets) {
    if (!tgt.codeSnippet) {
      correctedTargets.push(tgt);
      continue;
    }

    // Check for obvious syntax or missing export issues
    const isTs = tgt.filePath.endsWith('.ts') || tgt.filePath.endsWith('.tsx');
    const hasUnclosedBrackets = (tgt.codeSnippet.match(/\{/g) || []).length !== (tgt.codeSnippet.match(/\}/g) || []).length;

    if (isTs && hasUnclosedBrackets) {
      autoFixesApplied++;
      try {
        const fixPrompt = `Perbaiki sintaks TypeScript berikut yang memiliki tanda kurung kurawal tidak seimbang:\n\n${tgt.codeSnippet}\n\nKirimkan HANYA kode TypeScript murni tanpa markdown.`;
        const fixed = await generateAiContentWithFallback(fixPrompt, 'You are an expert TypeScript linter. Fix syntax error.');
        let cleanCode = fixed.text.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
        correctedTargets.push({ ...tgt, codeSnippet: cleanCode, description: `${tgt.description} (Autocorrected Syntax)` });
        continue;
      } catch (err) {
        console.warn('[AutoDev:SelfCorrection] Fix failed:', err);
      }
    }

    correctedTargets.push(tgt);
  }

  return { correctedTargets, autoFixesApplied };
}
