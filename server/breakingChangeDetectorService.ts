import fs from 'fs';
import path from 'path';

export interface BreakingChangeIssue {
  symbolName: string;
  type: 'removed_export' | 'param_count_changed' | 'type_mismatch' | 'strict_interface_addition';
  severity: 'breaking' | 'warning';
  description: string;
  suggestedMigration: string;
}

export function detectBreakingChangesInFile(workspaceRoot: string, filePath: string): BreakingChangeIssue[] {
  const issues: BreakingChangeIssue[] = [];
  const fullPath = path.join(workspaceRoot, filePath);
  if (!fs.existsSync(fullPath)) return issues;

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for deprecated exports without fallback
    if (line.includes('@deprecated') || line.includes('// deprecated')) {
      const nextLine = lines[index + 1] || '';
      const match = nextLine.match(/export\s+(?:function|interface|type|const)\s+([a-zA-Z0-9_$]+)/);
      if (match) {
        issues.push({
          symbolName: match[1],
          type: 'removed_export',
          severity: 'warning',
          description: `Simbol '${match[1]}' ditandai deprecated. Periksa modul konsumen sebelum menghapusnya.`,
          suggestedMigration: `Pertahankan alias atau wrapper adaptor selama 1 siklus rilis.`,
        });
      }
    }

    // Check for non-optional added parameters
    const fnMatch = line.match(/export\s+function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/);
    if (fnMatch) {
      const params = fnMatch[2].split(',').map((p) => p.trim()).filter(Boolean);
      const hasRequiredAfterOptional = params.some((p, i) => !p.includes('?') && !p.includes('=') && i > 0 && (params[i - 1].includes('?') || params[i - 1].includes('=')));
      if (hasRequiredAfterOptional) {
        issues.push({
          symbolName: fnMatch[1],
          type: 'param_count_changed',
          severity: 'breaking',
          description: `Parameter wajib ditempatkan setelah parameter opsional pada '${fnMatch[1]}', memicu breaking change.`,
          suggestedMigration: `Jadikan parameter baru opsional (misal: options?: OptionsType).`,
        });
      }
    }
  });

  return issues;
}
