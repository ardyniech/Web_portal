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
    const lines = fs.readFileSync(full, 'utf8').split('\n').length;
    const issuesForFile = scanFileStatically(fp, rootDir);
    staticIssues.push(...issuesForFile);
    filesReviewed.push({
      filePath: fp,
      linesChanged: lines,
      status: issuesForFile.length === 0 ? 'passed' : issuesForFile.some((i) => i.severity === 'critical') ? 'failed' : 'warning',
      issuesCount: issuesForFile.length,
    });
  }

  let aiIssues: PreFlightIssue[] = [];
  let modelName = 'deterministic-static';

  if (filePaths.length > 0) {
    const snippets = filePaths.slice(0, 3).map((fp) => {
      const full = path.join(rootDir, fp);
      return fs.existsSync(full) ? `### ${fp}\n\`\`\`typescript\n${fs.readFileSync(full, 'utf8').slice(0, 1000)}\n\`\`\`` : '';
    }).filter(Boolean).join('\n\n');

    const prompt = `Anda adalah Principal Security Auditor. Audit peer-review tingkat tinggi untuk keamanan dan arsitektur berkas:
Commit: [${commitHash}] ${commitMessage}\n\n${snippets}
KEMBALIKAN JSON VALID:
{
  "summary": "Ringkasan audit",
  "issues": [{ "id": "ai-1", "filePath": "path/file.ts", "ruleId": "SEC-401", "ruleName": "Nama", "category": "security", "severity": "critical", "message": "Pesan", "proposedFix": "Solusi", "fixable": true }]
}`;

    try {
      const aiRes = await generateAiContentWithFallback(prompt, 'Software architect and auditor.');
      let raw = aiRes.text.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
      const parsed = JSON.parse(raw.trim());
      if (Array.isArray(parsed.issues)) aiIssues = parsed.issues;
      modelName = aiRes.model;
    } catch (err: any) {
      console.warn('[Module:PreFlight] AI audit fallback:', err?.message);
    }
  }

  const allMap = new Map<string, PreFlightIssue>();
  for (const issue of [...staticIssues, ...aiIssues]) {
    allMap.set(`${issue.filePath}:${issue.ruleId}`, issue);
  }
  const combined = Array.from(allMap.values());
  const critical = combined.filter((i) => i.severity === 'critical').length;
  const arch = combined.filter((i) => i.severity === 'architectural').length;
  const warn = combined.filter((i) => i.severity === 'warning').length;

  const score = Math.max(0, 100 - critical * 30 - arch * 15 - warn * 5);
  const status = critical > 0 || arch > 0 ? 'failed' : warn > 0 ? 'warning' : 'passed';

  return {
    commitHash,
    commitMessage,
    score,
    status,
    summary: status === 'passed' ? 'Semua berkas lolos verifikasi keamanan & arsitektur.' : `Ditemukan ${critical} isu kritis & ${arch} pelanggaran arsitektur.`,
    filesReviewed,
    issues: combined,
    auditedAt: new Date().toISOString(),
    model: modelName,
  };
}
