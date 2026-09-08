import fs from 'fs';
import path from 'path';
import { applyFilesToWorkspace, FileWriteItem, RefactorApplyResult } from './refactorWriter';

export { applyFilesToWorkspace };
export type { FileWriteItem, RefactorApplyResult };

export interface FileCandidate {
  path: string;
  lines: number;
  size: number;
  priority: 'high' | 'medium' | 'normal';
}

const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', '.cache', 'build', 'coverage']);

export function getRefactorCandidateFiles(rootDir = process.cwd()): FileCandidate[] {
  const candidates: FileCandidate[] = [];
  const srcDir = path.join(rootDir, 'src');
  if (!fs.existsSync(srcDir)) return [];

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          scan(path.join(dir, entry.name));
        }
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        const fullPath = path.join(dir, entry.name);
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').length;
          const stat = fs.statSync(fullPath);
          const relPath = path.relative(rootDir, fullPath);
          const priority = lines > 110 ? 'high' : lines > 90 ? 'medium' : 'normal';
          candidates.push({ path: relPath, lines, size: stat.size, priority });
        } catch {
          // ignore unreadable
        }
      }
    }
  }

  scan(srcDir);
  return candidates.sort((a, b) => b.lines - a.lines);
}

export function readWorkspaceFileSafe(relPath: string, rootDir = process.cwd()): string {
  const cleanPath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(rootDir, cleanPath);
  if (!fullPath.startsWith(rootDir) || !fs.existsSync(fullPath)) {
    throw new Error(`Berkas tidak ditemukan atau berada di luar workspace: ${relPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

export function applyRefactorToWorkspace(
  relPath: string,
  newContent: string,
  commitMessage: string,
  rootDir = process.cwd()
): { success: boolean; commitHash: string; message: string; lines: number } {
  const res = applyFilesToWorkspace([{ filePath: relPath, content: newContent }], commitMessage, rootDir);
  return {
    success: res.success,
    commitHash: res.commitHash,
    message: res.message,
    lines: res.totalLines,
  };
}

