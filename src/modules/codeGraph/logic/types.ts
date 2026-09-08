export interface SymbolReference {
  symbolName: string;
  kind: 'function' | 'interface' | 'type' | 'class' | 'variable' | 'export';
  definedIn: string;
  references: {
    filePath: string;
    lineNumber: number;
    lineContent: string;
  }[];
}

export interface DependencyNode {
  id: string; // e.g. "auth" or "src/modules/auth"
  name: string;
  filePath: string;
  lineCount: number;
  importsCount: number;
  exportsCount: number;
  dependencies: string[]; // module ids it imports
  dependents: string[]; // module ids that import this
  circularWith?: string[];
}

export interface CodeGraphData {
  nodes: DependencyNode[];
  totalFiles: number;
  totalDependencies: number;
  circularCount: number;
  symbols: SymbolReference[];
  updatedAt: string;
}
