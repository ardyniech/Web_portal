import { execSync } from 'child_process';

export function createGitSnapshot(workspaceRoot: string): string {
  try {
    const hash = execSync('git rev-parse HEAD', { cwd: workspaceRoot }).toString().trim();
    return hash;
  } catch (err) {
    console.warn('[AutoDev:Rollback] Snapshot failed:', err);
    return '';
  }
}

export function rollbackWorkspaceToSnapshot(workspaceRoot: string, commitHash: string): { success: boolean; message: string } {
  try {
    if (!commitHash) {
      // Fallback clean uncommitted
      execSync('git checkout -- . && git clean -fd', { cwd: workspaceRoot });
      return { success: true, message: 'Workspace dikembalikan ke kondisi bersih' };
    }
    execSync(`git reset --hard ${commitHash}`, { cwd: workspaceRoot });
    return { success: true, message: `Berhasil melakukan rollback ke commit ${commitHash.slice(0, 7)}` };
  } catch (err: any) {
    console.error('[AutoDev:Rollback] Rollback error:', err);
    return { success: false, message: err?.message || 'Gagal melakukan rollback workspace' };
  }
}
