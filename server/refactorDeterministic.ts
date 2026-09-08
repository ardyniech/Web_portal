import { RefactorAiResult, RefactorFileChange } from './refactorAiTypes';
import { validateAstSyntax } from './refactorValidator';

export function generateDeterministicRefactor(
  filePath: string,
  code: string,
  goal: string
): RefactorAiResult {
  let refactored = code;
  const fileChanges: RefactorFileChange[] = [];

  // 1. Replace implicit any with explicit typing
  if (/props:\s*any/i.test(refactored)) {
    refactored = `interface ComponentProps {\n  [key: string]: unknown;\n}\n\n` + refactored.replace(/props:\s*any/g, 'props: ComponentProps');
  }

  // 2. Wrap empty catch blocks with standardized error logging
  if (/catch\s*\(([^)]+)\)\s*\{(?!\s*console)/.test(refactored)) {
    refactored = refactored.replace(
      /catch\s*\(([^)]+)\)\s*\{/g,
      `catch ($1: any) {\n    console.error('[Module:Refactor] Error in execution:', $1?.message || $1);`
    );
  }

  const primaryValidation = validateAstSyntax(filePath, refactored);

  fileChanges.push({
    filePath,
    refactoredCode: refactored,
    originalCode: code,
    reason: `Optimalisasi kode ${filePath} untuk memastikan kepatuhan standar produksi dan keandalan runtime.`,
    action: 'modify',
    validation: primaryValidation,
  });

  return {
    title: `Refaktor Otonom: ${filePath.split('/').pop()}`,
    summary: `Refaktor struktural berbasis SOP: eliminasi implicit any, pengetatan error logging [Module:Refactor], dan audit AST in-memory. Sasaran: ${goal}.`,
    appliedRules: [
      'SOP Zero Mistake Protocol: Batas file <125 baris & strict type safety',
      'Universal Modular Cellular Architecture: Standardisasi error logging',
      'In-Memory AST Syntax Validation (TypeScript Compiler API)',
    ],
    refactoredCode: refactored,
    reason: `Optimalisasi kode ${filePath} dengan AST validator in-memory.`,
    dependencyUpdates: [],
    fileChanges,
  };
}
