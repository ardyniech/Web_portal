import fs from 'fs';
import path from 'path';

export interface SymbolReferenceMatch {
  filePath: string;
  lineNumber: number;
  lineContent: string;
  kind: 'declaration' | 'call' | 'import' | 'type_usage';
}

export interface SymbolReferenceResult {
  symbolName: string;
  totalOccurrences: number;
  filesCount: number;
  matches: SymbolReferenceMatch[];
}

export function findSymbolReferences(workspaceRoot: string, symbolName: string): SymbolReferenceResult {
  const result: SymbolReferenceResult = {
    symbolName,
    totalOccurrences: 0,
    filesCount: 0,
    matches: [],
  };

  if (!symbolName || symbolName.trim().length === 0) return result;

  const targetDirs = [path.join(workspaceRoot, 'src'), path.join(workspaceRoot, 'server')];
  const matchedFiles = new Set<string>();
  const escaped = symbolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`);

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
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            let kind: SymbolReferenceMatch['kind'] = 'call';
            const trimmed = line.trim();
            if (trimmed.startsWith('import ') || trimmed.includes('from ')) kind = 'import';
            else if (trimmed.startsWith('export ') || trimmed.includes('function ' + symbolName) || trimmed.includes('interface ' + symbolName) || trimmed.includes('type ' + symbolName)) kind = 'declaration';
            else if (trimmed.includes(': ' + symbolName) || trimmed.includes('<' + symbolName + '>')) kind = 'type_usage';

            result.matches.push({
              filePath: path.relative(workspaceRoot, fullPath),
              lineNumber: index + 1,
              lineContent: trimmed.slice(0, 120),
              kind,
            });
            matchedFiles.add(fullPath);
          }
        });
      }
    }
  };

  targetDirs.forEach((d) => scan(d));
  result.totalOccurrences = result.matches.length;
  result.filesCount = matchedFiles.size;
  return result;
}
