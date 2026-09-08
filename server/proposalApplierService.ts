import fs from 'fs';
import path from 'path';
import { CodeProposalTarget } from './autoDevTypes';

export function applyCodeProposalToWorkspace(workspaceRoot: string, targets: CodeProposalTarget[]): { success: boolean; appliedFiles: string[] } {
  const appliedFiles: string[] = [];

  for (const target of targets) {
    if (!target.filePath || !target.codeSnippet) continue;
    const fullPath = path.isAbsolute(target.filePath) ? target.filePath : path.join(workspaceRoot, target.filePath);

    try {
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Clean snippet if it contains markdown code blocks ```ts ... ```
      let code = target.codeSnippet;
      if (code.startsWith('```')) {
        code = code.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
      }

      fs.writeFileSync(fullPath, code, 'utf-8');
      appliedFiles.push(target.filePath);
    } catch (err) {
      console.error(`[Module:AutoDev] Error applying code to ${target.filePath}:`, err);
    }
  }

  return { success: appliedFiles.length > 0, appliedFiles };
}
