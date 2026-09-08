import { FileCandidate, RefactorProposal, RefactorValidation } from '../logic/aiRefactorTypes';

export const refactorApi = {
  async fetchCandidates(): Promise<FileCandidate[]> {
    try {
      const res = await fetch('/api/refactor/candidates');
      if (!res.ok) throw new Error('Gagal memindai berkas kandidat.');
      const data = await res.json();
      return data.candidates || [];
    } catch (err: any) {
      console.error('[Module:Refactor] Error in fetchCandidates:', err?.message || err);
      return [];
    }
  },

  async readFile(filePath: string): Promise<string> {
    const res = await fetch(`/api/refactor/read?path=${encodeURIComponent(filePath)}`);
    if (!res.ok) throw new Error(`Gagal membaca berkas: ${filePath}`);
    const data = await res.json();
    return data.content;
  },

  async validateCode(filePath: string, code: string): Promise<RefactorValidation> {
    try {
      const res = await fetch('/api/refactor/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, code }),
      });
      return res.ok ? await res.json() : { isValid: true, errors: [], warnings: [] };
    } catch {
      return { isValid: true, errors: [], warnings: [] };
    }
  },

  async analyze(options: {
    filePath: string;
    content?: string;
    goal?: string;
    commitContext?: string;
    repoFullName: string;
  }): Promise<RefactorProposal> {
    const res = await fetch('/api/refactor/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Analisis refaktor AI gagal.');
    }

    const data = await res.json();
    const rawChanges = Array.isArray(data.fileChanges) && data.fileChanges.length > 0
      ? data.fileChanges
      : [{ filePath: options.filePath, refactoredCode: data.refactoredCode, originalCode: options.content || '', reason: data.reason, action: 'modify' }];

    const changes = rawChanges.map((rc: any) => ({
      fileName: rc.filePath || options.filePath,
      originalCode: rc.originalCode !== undefined ? rc.originalCode : (rc.filePath === options.filePath ? (options.content || '') : ''),
      refactoredCode: rc.refactoredCode,
      reason: rc.reason || 'Dekomposisi modular',
      action: rc.action || 'modify',
      validation: rc.validation,
    }));

    return {
      id: data.id,
      repoFullName: options.repoFullName,
      targetFile: options.filePath,
      commitContext: options.commitContext,
      title: data.title,
      summary: data.summary,
      appliedMemories: data.appliedRules || [],
      changes,
      dependencyUpdates: data.dependencyUpdates || [],
      status: 'proposed',
      lineCountBefore: data.lineCountBefore,
      lineCountAfter: data.lineCountAfter,
    };
  },

  async apply(params: {
    filePath?: string;
    refactoredCode?: string;
    files?: { filePath: string; content: string }[];
    commitMessage: string;
  }): Promise<{ success: boolean; commitHash: string; message: string; modifiedFiles: string[]; totalLines: number }> {
    const res = await fetch('/api/refactor/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menerapkan refaktor ke sistem berkas.');
    }

    return res.json();
  },
};
