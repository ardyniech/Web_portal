import { useState, useEffect, useMemo } from 'react';
import { CommitItem } from '../storage/commitApi';
import { CommitRangeSummary } from './commitSummaryTypes';
import { commitSummaryApi } from '../storage/commitSummaryApi';
import { devConsoleLogger } from '../../devConsole';
import { dispatcher } from '../../../core/dispatcher';

export function useCommitRangeSummary(repoFullName: string, commits: CommitItem[]) {
  const [headIndex, setHeadIndex] = useState<number>(0);
  const [baseIndex, setBaseIndex] = useState<number>(commits.length > 1 ? commits.length - 1 : 0);
  const [summary, setSummary] = useState<CommitRangeSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (commits.length > 0) {
      setHeadIndex(0);
      setBaseIndex(commits.length - 1);
    }
  }, [commits.length]);

  const selectedCommits = useMemo(() => {
    if (commits.length === 0) return [];
    const min = Math.min(headIndex, baseIndex);
    const max = Math.max(headIndex, baseIndex);
    return commits.slice(min, max + 1);
  }, [commits, headIndex, baseIndex]);

  const generateSummary = async () => {
    if (selectedCommits.length === 0) return;
    setIsGenerating(true);
    setError(null);

    const headSha = commits[Math.min(headIndex, baseIndex)]?.sha || 'head';
    const baseSha = commits[Math.max(headIndex, baseIndex)]?.sha || 'base';

    devConsoleLogger.addLog('reasoning', 'CommitSummary', `Memulai pembuatan ringkasan commit rentang ${baseSha.slice(0, 7)}...${headSha.slice(0, 7)} dengan Gemini...`);

    try {
      const result = await commitSummaryApi.summarizeRange({
        repoFullName,
        baseSha,
        headSha,
        commits: selectedCommits,
      });
      setSummary(result);
      devConsoleLogger.addLog('info', 'CommitSummary', `Ringkasan rentang commit berhasil dibuat (model: ${result.model}).`);
    } catch (err: any) {
      const msg = err.message || 'Gagal menghasilkan ringkasan rentang commit.';
      setError(msg);
      devConsoleLogger.addLog('error', 'CommitSummary', `Error pembuatan ringkasan: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMarkdown = async () => {
    if (!summary?.rawMarkdown) return;
    try {
      await navigator.clipboard.writeText(summary.rawMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      dispatcher.emit('notify:push', {
        type: 'success',
        title: 'Tersalin',
        message: 'Ringkasan commit berhasil disalin ke clipboard.',
      });
    } catch {
      // ignore clipboard error
    }
  };

  return {
    headIndex,
    setHeadIndex,
    baseIndex,
    setBaseIndex,
    selectedCommits,
    summary,
    isGenerating,
    error,
    copied,
    generateSummary,
    copyMarkdown,
  };
}
