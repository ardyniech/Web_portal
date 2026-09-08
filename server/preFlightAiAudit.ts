import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateAiContentWithFallback } from './geminiService';
import { getChangedOrCandidateFiles, scanFileStatically } from './preFlightScanner';
import { PreFlightAuditResult, PreFlightIssue, PreFlightFileReview } from './preFlightTypes';

export async function runFullPreFlightAudit(rootDir = process.cwd()): Promise<PreFlightAuditResult> {
  const filePaths = getChangedOrCandidateFiles(rootDir);
  let commitHash = 'local-head';
  let commitMessage = 'Perubahan lokal / staging workspace';

  try {
    commitHash = execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    commitMessage = execSync('git log -1 --pretty=%B', { cwd: rootDir, encoding: 'utf8' }).trim().split('\n')[0];
  } catch {
    // fallback
  }

  const staticIssues: PreFlightIssue[] = [];
  const filesReviewed: PreFlightFileReview[] = [];

  for (const fp of filePaths) {
    const full = path.join(rootDir, fp);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n').length;
    const issuesForFile = scanFileStatically(fp, rootDir);
    staticIssues.push(...issuesForFile);

    filesReviewed.push({
      filePath: fp,
      linesChanged: lines,
      status: issuesForFile.length === 0 ? 'passed' : issuesForFile.some((i) => i.severity === 'critical') ? 'failed' : 'warning',
      issuesCount: issuesForFile.length,
    });
  }

  // Next, run Gemini high-level peer-review if files exist
  let aiIssues: PreFlightIssue[] = [];
  let modelName = 'deterministic-static';

  if (filePaths.length > 0) {
    const fileSnippets = filePaths.slice(0, 3).map((fp) => {
      const full = path.join(rootDir, fp);
      if (!fs.existsSync(full)) return '';
      const text = fs.readFileSync(full, 'utf8');
      return `### Berkas: ${fp}\n\`\`\`typescript\n${text.slice(0, 1200)}\n\`\`\``;
    }).filter(Boolean).join('\n\n');

    const prompt = `Anda adalah Principal Security Auditor & Lead Software Architect. Lakukan audit peer-review tingkat tinggi untuk memeriksa celah keamanan (security vulnerabilities) dan pelanggaran arsitektur modular (architectural violations) pada berkas berikut:

Commit: [${commitHash}] ${commitMessage}

${fileSnippets}

Aturan SOP Arsitektur Wajib:
1. Batas ketat <125 baris per berkas.
2. Tidak boleh ada impor internal langsung antar modul (hanya boleh via core/dispatcher atau public API index.ts).
3. Format log error wajib: [Module:<Nama>] Error in <fungsi>: <pesan>.
4. Keamanan: Tidak ada raw token/secret, cegah XSS/eval, tangani rejection try/catch.

KEMBALIKAN HANYA JSON VALID:
{
  "summary": "Ringkasan hasil audit tingkat tinggi",
  "issues": [
    {
      "id": "ai-sec-1",
      "filePath": "path/ke/berkas.ts",
      "ruleId": "SEC-401 | ARCH-102 | LOG-301",
      "ruleName": "Nama Aturan",
      "category": "security | architecture | reliability",
      "severity": "critical | architectural | warning",
      "message": "Penjelasan detail kenapa ini melanggar standar",
      "proposedFix": "Langkah perbaikan konkret yang harus diterapkan",
      "fixable": true
    }
  ]
}`;

    try {
      const aiRes = await generateAiContentWithFallback(prompt, 'You are an elite software auditor and security researcher.');
      let raw = aiRes.text.trim();
      if (raw.startsWith('```json')) raw = raw.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      else if (raw.startsWith('```')) raw = raw.replace(/^```\s*/, '').replace(/```\s*$/, '');
      const parsed = JSON.parse(raw.trim());
      if (Array.isArray(parsed.issues)) {
        aiIssues = parsed.issues;
      }
      modelName = aiRes.model;
    } catch (err: any) {
      console.warn('[Module:PreFlight] Gemini audit fallback:', err?.message);
    }
  }

  // Deduplicate and combine issues
  const allIssuesMap = new Map<string, PreFlightIssue>();
  for (const issue of [...staticIssues, ...aiIssues]) {
    const key = `${issue.filePath}:${issue.ruleId}`;
    if (!allIssuesMap.has(key)) {
      allIssuesMap.set(key, issue);
    }
  }
  const combinedIssues = Array.from(allIssuesMap.values());

  const criticalCount = combinedIssues.filter((i) => i.severity === 'critical').length;
  const archCount = combinedIssues.filter((i) => i.severity === 'architectural').length;
  const warnCount = combinedIssues.filter((i) => i.severity === 'warning').length;

  const score = Math.max(0, 100 - criticalCount * 30 - archCount * 15 - warnCount * 5);
  const status = criticalCount > 0 ? 'failed' : archCount > 0 ? 'failed' : warnCount > 0 ? 'warning' : 'passed';

  return {
    commitHash,
    commitMessage,
    score,
    status,
    summary: status === 'passed'
      ? 'Semua berkas pada komit lokal lolos standar keamanan dan arsitektur seluler tingkat tinggi.'
      : `Ditemukan ${criticalCount} isu keamanan kritis dan ${archCount} pelanggaran arsitektur yang perlu diperbaiki.`,
    filesReviewed,
    issues: combinedIssues,
    auditedAt: new Date().toISOString(),
    model: modelName,
  };
}
