import { RefactorProposal, FileCandidate } from './aiRefactorTypes';
import { refactorApi } from '../storage/refactorApi';
import { autoRecordRepoProgress } from '../../memory';
import { devConsoleLogger } from '../../devConsole';
import { dispatcher } from '../../../core/dispatcher';

export async function fetchRefactorCandidates(): Promise<FileCandidate[]> {
  return refactorApi.fetchCandidates();
}

export async function generateRealRefactorProposal(options: {
  repoFullName: string;
  filePath?: string;
  goal?: string;
  commitMessage?: string;
}): Promise<RefactorProposal> {
  const { repoFullName, goal = 'modularitas & strict typing', commitMessage } = options;
  let targetPath = options.filePath;

  devConsoleLogger.addLog('reasoning', 'AIRefactorEngine', `Memindai berkas target refaktor untuk ${repoFullName}...`);

  if (!targetPath) {
    const candidates = await refactorApi.fetchCandidates();
    targetPath = candidates[0]?.path || 'src/components/AppHeader.tsx';
  }

  devConsoleLogger.addLog('reasoning', 'AIRefactorEngine', `Menganalisis kode riil ${targetPath} dengan AI Engine...`);
  
  const proposal = await refactorApi.analyze({
    filePath: targetPath,
    goal,
    commitContext: commitMessage,
    repoFullName,
  });

  devConsoleLogger.addLog('info', 'AIRefactorEngine', `Proposal riil dihasilkan untuk ${targetPath}: ${proposal.title}`);
  return proposal;
}

export function generateRefactorProposal(repoFullName: string, commitMessage?: string): RefactorProposal {
  return {
    id: `refactor-${Date.now()}`,
    repoFullName,
    targetFile: 'src/components/AppHeader.tsx',
    commitContext: commitMessage || 'Peningkatan struktur berkas & efisiensi modul',
    title: 'Proposal Refactoring Otonom & Kepatuhan SOP',
    summary: 'Restrukturisasi berkas ke standar modular cellular, pengetatan tipe interface, dan batas baris <125 baris.',
    appliedMemories: [
      'SOP Zero Mistake Protocol: Batas file <125 baris & strict type safety',
      'Universal Modular Architecture: Isolasi modul via core/dispatcher',
      'Resilient Error Handling: [Module:<Nama>] log format',
    ],
    changes: [],
    dependencyUpdates: [],
    status: 'proposed',
  };
}

export async function applyRefactorProposal(proposal: RefactorProposal): Promise<boolean> {
  devConsoleLogger.addLog('info', 'AIRefactorEngine', `Menerapkan refaktor riil [${proposal.id}] pada ${proposal.repoFullName}...`);

  if (proposal.changes.length === 0) {
    throw new Error('Tidak ada perubahan kode yang dapat diterapkan.');
  }

  const filesToWrite = proposal.changes.map((c) => ({
    filePath: c.fileName,
    content: c.refactoredCode,
  }));

  const commitMsg = `refactor: ${proposal.title} (${proposal.changes.map((c) => c.fileName.split('/').pop()).join(', ')})`;
  const res = await refactorApi.apply({
    files: filesToWrite,
    commitMessage: commitMsg,
  });

  autoRecordRepoProgress(
    proposal.repoFullName,
    `AI Refactor Executed: ${proposal.title}`,
    `Perubahan diterapkan pada ${res.modifiedFiles.join(', ')} (${res.totalLines} baris). Hash: ${res.commitHash}`
  );

  proposal.appliedCommitHash = res.commitHash;
  proposal.status = 'applied';

  dispatcher.emit('repo:commit_pushed', {
    repoFullName: proposal.repoFullName,
    message: commitMsg,
  });
  dispatcher.emit('git:status_updated');
  dispatcher.emit('timeMachine:refresh');
  dispatcher.emit('notify:push', {
    type: 'success',
    title: 'AI Refactor Berhasil Diterapkan',
    message: `${res.modifiedFiles.length} berkas berhasil diperbarui ke disk & dicatat di Git (${res.commitHash}).`,
  });

  devConsoleLogger.addLog('reasoning', 'AIRefactorEngine', `Refactoring sukses riil: ${res.modifiedFiles.join(', ')}.`);
  return true;
}
