import fs from 'fs';
import path from 'path';

export interface FileComplexityItem {
  filePath: string;
  lineCount: number;
  cyclomaticComplexity: number;
  densityStatus: 'safe' | 'warning' | 'critical';
  cognitiveLoadScore: number; // 0 - 100
  suggestedDecomposition: string | null;
}

export interface ComplexityAuditReport {
  totalFiles: number;
  filesApproachingLimit: number;
  criticalMonoliths: number;
  averageComplexity: number;
  files: FileComplexityItem[];
}

export function auditFileComplexity(workspaceRoot: string): ComplexityAuditReport {
  const items: FileComplexityItem[] = [];
  const targetDirs = [path.join(workspaceRoot, 'src'), path.join(workspaceRoot, 'server')];

  const scan = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        const lineCount = lines.length;

        // Estimate cyclomatic complexity by counting branch keywords
        let complexity = 1;
        const branchRegex = /\b(if|else if|for|while|case|catch|\?\s*[^:]+:)\b/g;
        const matches = content.match(branchRegex);
        if (matches) complexity += matches.length;

        const densityStatus = lineCount > 125 ? 'critical' : lineCount >= 100 ? 'warning' : 'safe';
        const cognitiveLoad = Math.min(100, Math.floor((lineCount / 125) * 50 + complexity * 2.5));

        let decomp: string | null = null;
        if (lineCount >= 100) {
          decomp = 'Pisahkan logic state murni ke custom hook atau dekomposisi sub-primitives.';
        }

        items.push({
          filePath: path.relative(workspaceRoot, fullPath),
          lineCount,
          cyclomaticComplexity: complexity,
          densityStatus,
          cognitiveLoadScore: cognitiveLoad,
          suggestedDecomposition: decomp,
        });
      }
    }
  };

  targetDirs.forEach((d) => scan(d));

  items.sort((a, b) => b.lineCount - a.lineCount);

  return {
    totalFiles: items.length,
    filesApproachingLimit: items.filter((i) => i.densityStatus === 'warning').length,
    criticalMonoliths: items.filter((i) => i.densityStatus === 'critical').length,
    averageComplexity: items.length > 0 ? Math.round(items.reduce((a, b) => a + b.cyclomaticComplexity, 0) / items.length) : 1,
    files: items,
  };
}
