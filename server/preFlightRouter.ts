import { Router } from 'express';
import { runFullPreFlightAudit } from './preFlightAiAudit';
import { executeRealPreFlightFix } from './preFlightFixer';
import { PreFlightIssue } from './preFlightTypes';

export const preFlightRouter = Router();

preFlightRouter.post('/audit', async (req, res) => {
  try {
    const result = await runFullPreFlightAudit();
    res.json(result);
  } catch (err: any) {
    console.error('[Module:PreFlight] Error in /audit:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Gagal menjalankan Pre-Flight Audit.' });
  }
});

preFlightRouter.post('/fix', async (req, res) => {
  try {
    const { issue } = req.body as { issue: PreFlightIssue };
    if (!issue || !issue.filePath) {
      return res.status(400).json({ error: 'Objek issue dan filePath wajib disertakan.' });
    }

    const result = await executeRealPreFlightFix(issue);
    res.json(result);
  } catch (err: any) {
    console.error('[Module:PreFlight] Error in /fix:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Gagal menerapkan perbaikan kode.' });
  }
});

preFlightRouter.post('/fix-all', async (req, res) => {
  try {
    const { issues } = req.body as { issues: PreFlightIssue[] };
    if (!Array.isArray(issues) || issues.length === 0) {
      return res.status(400).json({ error: 'Daftar issues tidak boleh kosong.' });
    }

    const results = [];
    for (const issue of issues) {
      try {
        const fixResult = await executeRealPreFlightFix(issue);
        results.push(fixResult);
      } catch (fixErr: any) {
        results.push({
          success: false,
          issueId: issue.id,
          filePath: issue.filePath,
          message: fixErr?.message || 'Gagal menerapkan fix',
        });
      }
    }

    const reAudit = await runFullPreFlightAudit();
    res.json({
      success: true,
      appliedCount: results.filter((r) => r.success).length,
      results,
      updatedAudit: reAudit,
    });
  } catch (err: any) {
    console.error('[Module:PreFlight] Error in /fix-all:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Gagal menjalankan perbaikan massal.' });
  }
});
