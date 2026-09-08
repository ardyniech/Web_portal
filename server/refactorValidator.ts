import ts from 'typescript';

export interface ValidationDiagnostic {
  line: number;
  message: string;
}

export interface AstValidationResult {
  isValid: boolean;
  errors: ValidationDiagnostic[];
  warnings: string[];
  lineCount: number;
}

export function validateAstSyntax(filePath: string, code: string): AstValidationResult {
  const lineCount = code.split('\n').length;
  const errors: ValidationDiagnostic[] = [];
  const warnings: string[] = [];

  try {
    const isJsx = /\.[tj]sx$/.test(filePath);
    const sf = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.Latest,
      true,
      isJsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const diagnostics = (sf as any).parseDiagnostics || [];
    for (const diag of diagnostics) {
      const pos = diag.start !== undefined ? sf.getLineAndCharacterOfPosition(diag.start) : null;
      const msg =
        typeof diag.messageText === 'string'
          ? diag.messageText
          : diag.messageText?.messageText || 'Syntax error';
      errors.push({
        line: pos ? pos.line + 1 : 1,
        message: msg,
      });
    }

    if (lineCount > 125) {
      warnings.push(`Ukuran berkas (${lineCount} baris) melebihi batas SOP 125 baris.`);
    }

    if (/:\s*any\b/.test(code)) {
      warnings.push('Terdeteksi tipe `any` tanpa pengaman tipe interface eksplisit.');
    }

    if (/console\.log\(/.test(code)) {
      warnings.push('Gunakan logger terstandar [Module:<Nama>] alih-alih console.log polos.');
    }
  } catch (err: any) {
    errors.push({
      line: 1,
      message: err?.message || 'Gagal memproses AST TypeScript.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    lineCount,
  };
}
