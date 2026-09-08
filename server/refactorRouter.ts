import { Router } from 'express';
import {
  getRefactorCandidateFiles,
  readWorkspaceFileSafe,
  applyRefactorToWorkspace,
  applyFilesToWorkspace,
} from './refactorService';
import { analyzeAndRefactorCode } from './refactorAiService';
import { validateAstSyntax } from './refactorValidator';

export const refactorRouter = Router();

refactorRouter.get('/candidates', (req, res) => {
  try {
    const candidates = getRefactorCandidateFiles();
    res.json({ candidates });
  } catch (error: any) {
    console.error('[Module:Refactor] Error in get candidates:', error?.message);
    res.status(500).json({ error: 'Gagal memindai berkas kandidat refaktor.' });
  }
});

refactorRouter.get('/read', (req, res) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).json({ error: 'Path berkas tidak boleh kosong.' });
    const content = readWorkspaceFileSafe(filePath);
    res.json({ content, lines: content.split('\n').length });
  } catch (error: any) {
    console.error('[Module:Refactor] Error reading file:', error?.message);
    res.status(404).json({ error: error.message || 'Gagal membaca berkas.' });
  }
});

refactorRouter.post('/validate', (req, res) => {
  try {
    const { filePath, code } = req.body;
    if (!filePath || typeof code !== 'string') {
      return res.status(400).json({ error: 'filePath dan code diperlukan untuk validasi AST.' });
    }
    const result = validateAstSyntax(filePath, code);
    res.json(result);
  } catch (error: any) {
    console.error('[Module:Refactor] Error in AST validation:', error?.message);
    res.status(500).json({ error: 'Gagal memvalidasi AST.' });
  }
});

refactorRouter.post('/analyze', async (req, res) => {
  try {
    const { filePath, content: clientContent, goal = 'modularitas & strict typing', commitContext } = req.body;
    if (!filePath) return res.status(400).json({ error: 'Path berkas diperlukan.' });

    let originalCode = clientContent;
    if (!originalCode) originalCode = readWorkspaceFileSafe(filePath);

    const aiResult = await analyzeAndRefactorCode(filePath, originalCode, goal, commitContext);
    const lineCountBefore = originalCode.split('\n').length;
    const lineCountAfter = aiResult.refactoredCode.split('\n').length;

    res.json({
      id: `refactor-${Date.now()}`,
      filePath,
      lineCountBefore,
      lineCountAfter,
      ...aiResult,
    });
  } catch (error: any) {
    console.error('[Module:Refactor] Error analyzing code:', error?.message);
    res.status(500).json({ error: error.message || 'Gagal menganalisis kode untuk refaktor.' });
  }
});

refactorRouter.post('/apply', (req, res) => {
  try {
    const { filePath, refactoredCode, commitMessage, files } = req.body;

    // Support both multi-file and single-file payload
    const writeList: { filePath: string; content: string }[] = Array.isArray(files) && files.length > 0
      ? files
      : filePath && refactoredCode
      ? [{ filePath, content: refactoredCode }]
      : [];

    if (writeList.length === 0) {
      return res.status(400).json({ error: 'Tidak ada berkas yang disediakan untuk diterapkan.' });
    }

    // Pre-Apply AST Syntax Check
    for (const item of writeList) {
      const val = validateAstSyntax(item.filePath, item.content);
      if (!val.isValid) {
        return res.status(422).json({
          error: `Sintaks tidak valid pada ${item.filePath}. Penulisan dibatalkan demi keamanan.`,
          diagnostics: val.errors,
        });
      }
    }

    const result = applyFilesToWorkspace(writeList, commitMessage);
    res.json(result);
  } catch (error: any) {
    console.error('[Module:Refactor] Error applying refactor:', error?.message);
    res.status(500).json({ error: error.message || 'Gagal menerapkan refaktor ke berkas.' });
  }
});
