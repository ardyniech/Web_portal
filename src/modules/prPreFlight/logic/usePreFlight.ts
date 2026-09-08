import { useState, useEffect } from 'react';
import { PreFlightState, PreFlightStatus, PreFlightIssue, PreFlightFixResult } from './types';
import { getStoredPreFlightState } from '../storage/preFlightStorage';
import { runPreFlightAudit, autoFixPreFlightIssue, autoFixAllPreFlightIssues, resetPreFlightState } from './preFlightEngine';
import { dispatcher } from '../../../core/dispatcher';

export function usePreFlight() {
  const [state, setState] = useState<PreFlightState>(getStoredPreFlightState());
  const [isRunning, setIsRunning] = useState(false);
  const [fixingIssueId, setFixingIssueId] = useState<string | null>(null);
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'security' | 'architecture'>('all');

  useEffect(() => {
    const unsubUpdate = dispatcher.on('preflight:updated', (data: PreFlightState) => {
      setState(data);
      setIsRunning(false);
    });

    const unsubStatus = dispatcher.on('preflight:status', (status: PreFlightStatus) => {
      setIsRunning(status === 'scanning');
      setState((prev) => ({ ...prev, status }));
    });

    return () => {
      unsubUpdate();
      unsubStatus();
    };
  }, []);

  const triggerAudit = async () => {
    setIsRunning(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await runPreFlightAudit();
      setState(res);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menjalankan audit.');
    } finally {
      setIsRunning(false);
    }
  };

  const applyFix = async (issue: PreFlightIssue) => {
    setFixingIssueId(issue.id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const { fixResult, updatedState } = await autoFixPreFlightIssue(issue);
      setState(updatedState);
      setSuccessMessage(`Berhasil memperbaiki ${issue.ruleId}. Commit: ${fixResult.commitHash}`);
    } catch (err: any) {
      setErrorMessage(err?.message || `Gagal memperbaiki ${issue.ruleId}.`);
    } finally {
      setFixingIssueId(null);
    }
  };

  const applyFixAll = async () => {
    if (state.issues.length === 0) return;
    setIsFixingAll(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const { appliedCount, updatedState } = await autoFixAllPreFlightIssues(state.issues);
      setState(updatedState);
      setSuccessMessage(`Berhasil menerapkan ${appliedCount} perbaikan!`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menerapkan semua perbaikan.');
    } finally {
      setIsFixingAll(false);
    }
  };

  const reset = () => {
    const fresh = resetPreFlightState();
    setState(fresh);
    setIsRunning(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const filteredIssues = state.issues.filter((issue) => {
    if (activeTab === 'security') return issue.category === 'security' || issue.severity === 'critical';
    if (activeTab === 'architecture') return issue.category === 'architecture' || issue.severity === 'architectural';
    return true;
  });

  return {
    state,
    isRunning,
    fixingIssueId,
    isFixingAll,
    errorMessage,
    successMessage,
    activeTab,
    setActiveTab,
    filteredIssues,
    triggerAudit,
    applyFix,
    applyFixAll,
    reset,
  };
}
