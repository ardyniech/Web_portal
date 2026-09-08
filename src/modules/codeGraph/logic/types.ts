export interface DependencyNode {
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

export interface CodeGraphData {
  nodes: DependencyNode[];
  totalFiles: number;
  totalDependencies: number;
  circularCount: number;
  updatedAt: string;
}

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

export interface TypeDefinitionResult {
  target: string;
  filePath: string;
  signatures: string[];
  fullDefinitionText: string;
  found: boolean;
}
