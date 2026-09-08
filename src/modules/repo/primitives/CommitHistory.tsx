import React, { useState, useEffect } from 'react';
import { commitApi, CommitItem } from '../storage/commitApi';
import { generateRefactorProposal } from '../logic/aiRefactorEngine';
import { RefactorProposal } from '../logic/aiRefactorTypes';
import { CommitTimelineItem } from './CommitTimelineItem';
import { CommitDiffModal } from './CommitDiffModal';
import { AiRefactorModal } from './AiRefactorModal';
import { CommitRangeSummaryModal } from './CommitRangeSummaryModal';
import { CommitHistoryHeaderActions } from './CommitHistoryHeaderActions';
import { useAuth } from '../../auth';
import { dispatcher } from '../../../core/dispatcher';
import { Card } from '../../../shared/atoms/Card';
import { Loader2 } from 'lucide-react';

interface CommitHistoryProps {
  repoFullName: string;
}

export function CommitHistory({ repoFullName }: CommitHistoryProps) {
  const { token } = useAuth();
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSha, setSelectedSha] = useState<string | null>(null);
  const [activeProposal, setActiveProposal] = useState<RefactorProposal | null>(null);
  const [showRangeSummary, setShowRangeSummary] = useState(false);

  const loadCommits = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await commitApi.fetchRecentCommits(repoFullName, token, 10);
      setCommits(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat riwayat commit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommits();
    const unsub = dispatcher.on('repo:commit_pushed', () => {
      loadCommits();
    });
    return () => unsub();
  }, [repoFullName, token]);

  const handleTriggerRefactor = (commitMsg?: string) => {
    const proposal = generateRefactorProposal(repoFullName, commitMsg);
    setActiveProposal(proposal);
  };

  return (
    <>
      <Card
        title="Riwayat Commit"
        subtitle="Daftar commit terbaru dengan AI Range Summarizer & Refactor"
        headerAction={
          <CommitHistoryHeaderActions
            loading={loading}
            hasCommits={commits.length > 0}
            onRefresh={loadCommits}
            onOpenRangeSummary={() => setShowRangeSummary(true)}
            onTriggerRefactor={() => handleTriggerRefactor()}
          />
        }
      >
        {loading && commits.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-zinc-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            <span className="text-xs">Mengambil riwayat commit...</span>
          </div>
        ) : error ? (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>
        ) : commits.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">Belum ada catatan commit pada repositori ini.</p>
        ) : (
          <div className="relative flex flex-col gap-3.5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-[2px] before:bg-zinc-200">
            {commits.map((item, idx) => (
              <CommitTimelineItem
                key={item.sha || idx}
                item={item}
                onViewDiff={() => setSelectedSha(item.sha)}
                onRefactor={() => handleTriggerRefactor(item.commit.message)}
              />
            ))}
          </div>
        )}
      </Card>

      {selectedSha && (
        <CommitDiffModal
          repoFullName={repoFullName}
          sha={selectedSha}
          onClose={() => setSelectedSha(null)}
        />
      )}

      {activeProposal && (
        <AiRefactorModal
          proposal={activeProposal}
          onClose={() => setActiveProposal(null)}
        />
      )}

      {showRangeSummary && (
        <CommitRangeSummaryModal
          repoFullName={repoFullName}
          commits={commits}
          onClose={() => setShowRangeSummary(false)}
        />
      )}
    </>
  );
}
