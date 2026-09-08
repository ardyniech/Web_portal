import fs from 'fs';
import path from 'path';

export interface DeepRepoContext {
  moduleNames: string[];
  serverRouters: string[];
  architectureGuidelines: string[];
  formattedSummary: string;
}

export function analyzeDeepRepoContext(workspaceRoot: string): DeepRepoContext {
  const modulesDir = path.join(workspaceRoot, 'src', 'modules');
  const serverDir = path.join(workspaceRoot, 'server');

  let moduleNames: string[] = [];
  if (fs.existsSync(modulesDir)) {
    moduleNames = fs.readdirSync(modulesDir).filter((item) => {
      try {
        return fs.statSync(path.join(modulesDir, item)).isDirectory();
      } catch {
        return false;
      }
    });
  }

  let serverRouters: string[] = [];
  if (fs.existsSync(serverDir)) {
    serverRouters = fs.readdirSync(serverDir).filter((f) => f.endsWith('Router.ts') || f.endsWith('Service.ts'));
  }

  const architectureGuidelines = [
    'Cellular Modular Architecture: Each feature must reside in src/modules/<feature-name>/ with primitives/, logic/, storage/, and index.ts (public API).',
    'Strict File Size Limit: Every file MUST be under 125 lines. Break larger files into sub-components or helpers.',
    'Inter-Module Isolation: Direct cross-module internal imports are forbidden. Use core/dispatcher or import from public index.ts.',
    'Server & API Synergy: Express routers in server/ must pair with storage adapters in src/modules/<feature-name>/storage/.',
    'Deep Continuation: When implementing a feature, generate ALL required layer files (UI primitives, hooks/logic, storage/APIs, server router endpoints, index.ts, and loader registration) so the feature is 100% complete.',
  ];

  const formattedSummary = `[Deep Repo Architecture]
- Existing Modules (${moduleNames.length}): ${moduleNames.join(', ')}
- Server Routers/Services (${serverRouters.length}): ${serverRouters.slice(0, 10).join(', ')}
- System Architecture Rules:
  1. Cellular folders: primitives/, logic/, storage/, index.ts
  2. <125 lines per file limit
  3. Complete multi-file end-to-end implementation (don't limit to 1-2 files; generate 3 to 8 complete files for full feature depth).`;

  return { moduleNames, serverRouters, architectureGuidelines, formattedSummary };
}
