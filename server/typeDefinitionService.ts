import fs from 'fs';
import path from 'path';

export interface TypeDefinitionResult {
  target: string;
  filePath: string;
  signatures: string[];
  fullDefinitionText: string;
  found: boolean;
}

export function extractTypeDefinition(workspaceRoot: string, targetName: string): TypeDefinitionResult {
  const result: TypeDefinitionResult = {
    target: targetName,
    filePath: '',
    signatures: [],
    fullDefinitionText: '',
    found: false,
  };

  if (!targetName || targetName.trim().length === 0) return result;

  const targetDirs = [path.join(workspaceRoot, 'src'), path.join(workspaceRoot, 'server')];
  const escaped = targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const typeRegex = new RegExp(`export\\s+(interface|type|enum|class|function|const)\\s+${escaped}\\b`);

  const scan = (dir: string) => {
    if (result.found || !fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (result.found) return;
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (typeRegex.test(content)) {
          result.found = true;
          result.filePath = path.relative(workspaceRoot, fullPath);

          const lines = content.split('\n');
          const extractedLines: string[] = [];
          let capturing = false;
          let braceCount = 0;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (typeRegex.test(line)) {
              capturing = true;
            }
            if (capturing) {
              extractedLines.push(line);
              braceCount += (line.match(/{/g) || []).length;
              braceCount -= (line.match(/}/g) || []).length;
              if (braceCount <= 0 && extractedLines.length > 0 && (line.includes(';') || line.includes('}'))) {
                break;
              }
            }
          }

          result.fullDefinitionText = extractedLines.join('\n');
          result.signatures = extractedLines.map((l) => l.trim()).filter(Boolean);
          return;
        }
      }
    }
  };

  targetDirs.forEach((d) => scan(d));
  return result;
}
