import { PreFlightState, PreFlightIssue, PreFlightFixResult } from '../logic/types';

export const preFlightApi = {
  async runAudit(): Promise<PreFlightState> {
    const res = await fetch('/api/preflight/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Audit Pre-Flight gagal.');
    }

    const data = await res.json();
    return {
      status: data.status,
      commitHash: data.commitHash,
      commitMessage: data.commitMessage,
      score: data.score,
      summary: data.summary,
      filesReviewed: data.filesReviewed || [],
      issues: data.issues || [],
      startedAt: data.auditedAt || new Date().toISOString(),
      model: data.model,
    };
  },

  async applyFix(issue: PreFlightIssue): Promise<PreFlightFixResult> {
    const res = await fetch('/api/preflight/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Gagal memperbaiki ${issue.ruleId}.`);
    }

    return await res.json();
  },

  async applyFixAll(issues: PreFlightIssue[]): Promise<{
    success: boolean;
    appliedCount: number;
    results: PreFlightFixResult[];
    updatedAudit: PreFlightState;
  }> {
    const res = await fetch('/api/preflight/fix-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issues }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menerapkan semua perbaikan.');
    }

    return await res.json();
  },
};
