import fs from 'fs';
import path from 'path';

export interface ServerDependencyNode {
  id: string;
  name: string;
  filePath: string;
  lineCount: number;
  importsCount: number;
  exportsCount: number;
  dependencies: string[];
  dependents: string[];
  circularWith?: string[];
}

export function scanCodeGraph(workspaceRoot: string) {
  const modulesDir = path.join(workspaceRoot, 'src', 'modules');
  const result: { nodes: ServerDependencyNode[]; totalFiles: number; totalDependencies: number; circularCount: number } = {
    nodes: [],
    totalFiles: 0,
    totalDependencies: 0,
    circularCount: 0,
  };

  if (!fs.existsSync(modulesDir)) return result;
  const moduleFolders = fs.readdirSync(modulesDir).filter((f) => fs.statSync(path.join(modulesDir, f)).isDirectory());

  const nodeMap: Record<string, ServerDependencyNode> = {};

  moduleFolders.forEach((mod) => {
    const indexPath = path.join(modulesDir, mod, 'index.ts');
    let lineCount = 0;
    const deps: string[] = [];

    // Scan files in module
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
          scanDir(full);
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          result.totalFiles++;
          const content = fs.readFileSync(full, 'utf-8');
          lineCount += content.split('\n').length;

          // match module imports
          const importMatches = content.matchAll(/from\s+['"](?:\.\.\/)+([a-zA-Z0-9_-]+)/g);
          for (const m of importMatches) {
            const targetMod = m[1];
            if (targetMod !== mod && moduleFolders.includes(targetMod) && !deps.includes(targetMod)) {
              deps.push(targetMod);
            }
          }
        }
      }
    };

    scanDir(path.join(modulesDir, mod));

    nodeMap[mod] = {
      id: mod,
      name: mod,
      filePath: `src/modules/${mod}`,
      lineCount,
      importsCount: deps.length,
      exportsCount: 0,
      dependencies: deps,
      dependents: [],
    };
    result.totalDependencies += deps.length;
  });

  // Calculate dependents
  Object.values(nodeMap).forEach((node) => {
    node.dependencies.forEach((dep) => {
      if (nodeMap[dep] && !nodeMap[dep].dependents.includes(node.id)) {
        nodeMap[dep].dependents.push(node.id);
      }
    });
  });

  result.nodes = Object.values(nodeMap);
  return result;
}
