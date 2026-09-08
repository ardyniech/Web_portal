import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface FileWriteItem {
  filePath: string;
  content: string;
}

export interface RefactorApplyResult {
  success: boolean;
  commitHash: string;
  message: string;
  modifiedFiles: string[];
  totalLines: number;
}

export function applyFilesToWorkspace(
  files: FileWriteItem[],
  commitMessage: string,
  rootDir = process.cwd()
): RefactorApplyResult {
  if (!files || files.length === 0) {
    throw new Error('Tidak ada berkas yang disediakan untuk diterapkan.');
  }

  const modifiedPaths: string[] = [];
  let totalLines = 0;

  for (const file of files) {
    const cleanPath = path.normalize(file.filePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(rootDir, cleanPath);
    if (!fullPath.startsWith(rootDir)) {
      throw new Error(`Path berkas tidak aman: ${file.filePath}`);
    }

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, file.content, 'utf8');
    modifiedPaths.push(cleanPath);
    totalLines += file.content.split('\n').length;
  }

  let commitHash = 'local';
  try {
    for (const relPath of modifiedPaths) {
      execSync(`git add "${relPath}"`, { cwd: rootDir, stdio: 'pipe' });
    }
    const defaultMsg =
      modifiedPaths.length === 1
        ? `refactor: optimize ${path.basename(modifiedPaths[0])}`
        : `refactor: modular decomposition (${modifiedPaths.length} files)`;
    const msg = commitMessage || defaultMsg;
    execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: rootDir, stdio: 'pipe' });
    commitHash = execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch (gitErr: any) {
    console.warn('[Module:Refactor] Git commit skipped or tree clean:', gitErr?.message);
  }

  return {
    success: true,
    commitHash,
    message: `Berhasil menerapkan refaktor pada ${modifiedPaths.length} berkas (${totalLines} baris).`,
    modifiedFiles: modifiedPaths,
    totalLines,
  };
}
