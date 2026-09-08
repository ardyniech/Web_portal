import { Router } from 'express';
import { summarizeCommitRange, CommitSummaryItem } from './commitSummaryService';

export const commitSummaryRouter = Router();

commitSummaryRouter.post('/range-summary', async (req, res) => {
  try {
    const { repoFullName, baseSha, headSha, commits } = req.body;

    if (!repoFullName) {
      return res.status(400).json({ error: 'repoFullName diperlukan.' });
    }

    if (!Array.isArray(commits) || commits.length === 0) {
      return res.status(400).json({ error: 'Daftar commit tidak boleh kosong.' });
    }

    const safeBaseSha = baseSha || commits[commits.length - 1]?.sha || 'base';
    const safeHeadSha = headSha || commits[0]?.sha || 'head';

    const cleanCommits: CommitSummaryItem[] = commits.map((c: any) => ({
      sha: c.sha || '',
      message: c.commit?.message || c.message || 'No message',
      author: c.commit?.author?.name || c.author?.login || c.author || 'Contributor',
      date: c.commit?.author?.date || c.date || new Date().toISOString(),
    }));

    const result = await summarizeCommitRange({
      repoFullName,
      baseSha: safeBaseSha,
      headSha: safeHeadSha,
      commits: cleanCommits,
    });

    res.json(result);
  } catch (error: any) {
    console.error('[Module:CommitSummary] Error in range-summary:', error?.message || error);
    res.status(500).json({ error: error.message || 'Gagal membuat ringkasan rentang commit.' });
  }
});
