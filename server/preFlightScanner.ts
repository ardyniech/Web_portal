import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PreFlightIssue, PreFlightFileReview } from './preFlightTypes';

export function getChangedOrCandidateFiles(rootDir = process.cwd()): string[] {
  const fileSet = new Set<string>();
  try {
    const gitStatus = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' });
    for (const line of gitStatus.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parts = trimmed.split(/\s+/);
      const filePath = parts[parts.length - 1];
      if (filePath && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
        fileSet.add(filePath);
      }
    }
  } catch {
    // ignore git status error
  }

  if (fileSet.size === 0) {
    try {
      const gitLog = execSync('git diff --name-only HEAD~1 HEAD', { cwd: rootDir, encoding: 'utf8' });
      for (const line of gitLog.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && (trimmed.endsWith('.ts') || trimmed.endsWith('.tsx'))) {
          fileSet.add(trimmed);
        }
      }
    } catch {
      // fallback
    }
  }

  // If still empty or small, include sample src files
  if (fileSet.size === 0) {
    const defaultFiles = [
      'src/modules/auth/storage/authStorage.ts',
      'src/modules/auth/logic/authEngine.ts',
      'src/modules/systemHealth/primitives/SystemHealthModal.tsx',
      'src/modules/repo/primitives/CommitHistory.tsx',
    ];
    for (const df of defaultFiles) {
      if (fs.existsSync(path.join(rootDir, df))) fileSet.add(df);
    }
  }

  return Array.from(fileSet).slice(0, 10);
}

export function scanFileStatically(filePath: string, rootDir = process.cwd()): PreFlightIssue[] {
  const fullPath = path.join(rootDir, filePath);
  if (!fs.existsSync(fullPath)) return [];

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const issues: PreFlightIssue[] = [];

  // Rule 1: File size > 125 lines (Architectural Violation)
  if (lines.length > 125) {
    issues.push({
      id: `issue-size-${path.basename(filePath)}`,
      filePath,
      ruleId: 'ARCH-SIZE-101',
      ruleName: 'Strict File Size Limit (<125 Lines)',
      category: 'architecture',
      severity: 'architectural',
      message: `Berkas memiliki ${lines.length} baris, melampaui batas ketat arsitektur seluler (<125 baris).`,
      proposedFix: 'Dekomposisi berkas menjadi sub-komponen, hook khusus, atau utility helper murni.',
      fixable: true,
    });
  }

  // Rule 2: Cross-module direct internal import violation
  const crossModuleMatch = content.match(/from\s+['"](?:\.\.\/)+modules\/([a-zA-Z0-9_-]+)\/(?:logic|storage|primitives)\/[^'"]+['"]/);
  if (crossModuleMatch) {
    issues.push({
      id: `issue-cross-${path.basename(filePath)}`,
      filePath,
      ruleId: 'ARCH-MOD-201',
      ruleName: 'Cross-Module Direct Import Violation',
      category: 'architecture',
      severity: 'architectural',
      message: `Terdeteksi impor internal langsung ke modul '${crossModuleMatch[1]}'. Komunikasi antar modul WAJIB lewat core/dispatcher atau public API index.ts.`,
      codeSnippet: crossModuleMatch[0],
      proposedFix: `Gunakan dispatcher.emit / dispatcher.on atau impor dari modules/${crossModuleMatch[1]} (public API).`,
      fixable: true,
    });
  }

  // Rule 3: Unhandled raw token in localStorage (Security)
  if (content.includes('localStorage.setItem') && /token|auth|secret|jwt/i.test(content) && !content.includes('encrypt') && !content.includes('btoa')) {
    issues.push({
      id: `issue-sec-token-${path.basename(filePath)}`,
      filePath,
      ruleId: 'SEC-STORE-301',
      ruleName: 'Insecure Token Storage Risk',
      category: 'security',
      severity: 'critical',
      message: 'Penyimpanan token autentikasi sensitif pada localStorage tanpa lapisan enkripsi atau sanitasi.',
      proposedFix: 'Amankan penyimpanan token dengan enkripsi base64/AES ringan atau gunakan memori session terproteksi.',
      fixable: true,
    });
  }

  return issues;
}
