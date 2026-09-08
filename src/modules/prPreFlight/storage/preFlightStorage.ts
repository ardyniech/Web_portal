import { PreFlightState } from '../logic/types';

const STORAGE_KEY = 'agent_pr_pre_flight_state_v2';

export const INITIAL_PREFLIGHT_STATE: PreFlightState = {
  status: 'pending',
  commitHash: 'workspace',
  commitMessage: 'Siap untuk audit pra-push PR',
  score: 100,
  summary: 'Klik tombol Mulai Audit untuk memindai celah keamanan dan pelanggaran arsitektur.',
  filesReviewed: [],
  issues: [],
  startedAt: new Date().toISOString(),
};

export function getStoredPreFlightState(): PreFlightState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_PREFLIGHT_STATE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Module:prPreFlight] Error reading stored state:', err);
    return INITIAL_PREFLIGHT_STATE;
  }
}

export function saveStoredPreFlightState(state: PreFlightState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('[Module:prPreFlight] Error saving stored state:', err);
  }
}

export function clearStoredPreFlightState(): PreFlightState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[Module:prPreFlight] Error clearing stored state:', err);
  }
  return INITIAL_PREFLIGHT_STATE;
}
