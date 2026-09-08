import { PreFlightState, PreFlightIssue, PreFlightFixResult } from './types';
import { preFlightApi } from '../storage/preFlightApi';
import { getStoredPreFlightState, saveStoredPreFlightState, clearStoredPreFlightState } from '../storage/preFlightStorage';
import { dispatcher } from '../../../core/dispatcher';
import { devConsoleLogger } from '../../devConsole';

export async function runPreFlightAudit(): Promise<PreFlightState> {
  devConsoleLogger.addLog('info', 'Pre-Flight', 'Memulai audit Pra-Push PR tingkat tinggi...');
  dispatcher.emit('preflight:status', 'scanning');

  try {
    const result = await preFlightApi.runAudit();
    saveStoredPreFlightState(result);

    if (result.status === 'passed') {
      devConsoleLogger.addLog('info', 'Pre-Flight', 'Audit Pra-Push lolos! Bebas celah keamanan & pelanggaran arsitektur.');
    } else {
      devConsoleLogger.addLog('warn', 'Pre-Flight', `Ditemukan ${result.issues.length} temuan: ${result.summary}`);
    }

    dispatcher.emit('preflight:updated', result);
    return result;
  } catch (err: any) {
    const errMsg = err?.message || 'Galat saat memindai repositori.';
    devConsoleLogger.addLog('error', 'Pre-Flight', `Audit gagal: ${errMsg}`);
    const currentState = getStoredPreFlightState();
    dispatcher.emit('preflight:updated', currentState);
    throw err;
  }
}

export async function autoFixPreFlightIssue(issue: PreFlightIssue): Promise<{
  fixResult: PreFlightFixResult;
  updatedState: PreFlightState;
}> {
  devConsoleLogger.addLog('info', 'Pre-Flight', `Menerapkan fix nyata untuk [${issue.ruleId}] pada ${issue.filePath}...`);

  try {
    const fixResult = await preFlightApi.applyFix(issue);
    devConsoleLogger.addLog('info', 'Pre-Flight', `Perbaikan berhasil! Commit hash: ${fixResult.commitHash}`);

    // Re-run audit to get authentic new state
    const updatedState = await runPreFlightAudit();

    dispatcher.emit('git:status_updated', { commitHash: fixResult.commitHash });
    dispatcher.emit('timeMachine:refresh', {});
    return { fixResult, updatedState };
  } catch (err: any) {
    const errMsg = err?.message || 'Gagal menerapkan perbaikan.';
    devConsoleLogger.addLog('error', 'Pre-Flight', `Perbaikan gagal: ${errMsg}`);
    throw err;
  }
}

export async function autoFixAllPreFlightIssues(issues: PreFlightIssue[]): Promise<{
  appliedCount: number;
  updatedState: PreFlightState;
}> {
  devConsoleLogger.addLog('info', 'Pre-Flight', `Menerapkan perbaikan massal untuk ${issues.length} isu...`);

  try {
    const result = await preFlightApi.applyFixAll(issues);
    devConsoleLogger.addLog('info', 'Pre-Flight', `Selesai menerapkan ${result.appliedCount} perbaikan!`);

    saveStoredPreFlightState(result.updatedAudit);
    dispatcher.emit('preflight:updated', result.updatedAudit);
    dispatcher.emit('git:status_updated', {});
    return {
      appliedCount: result.appliedCount,
      updatedState: result.updatedAudit,
    };
  } catch (err: any) {
    const errMsg = err?.message || 'Gagal menerapkan perbaikan massal.';
    devConsoleLogger.addLog('error', 'Pre-Flight', `Perbaikan massal gagal: ${errMsg}`);
    throw err;
  }
}

export function resetPreFlightState(): PreFlightState {
  const fresh = clearStoredPreFlightState();
  dispatcher.emit('preflight:updated', fresh);
  return fresh;
}
