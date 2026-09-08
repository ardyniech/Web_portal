import { GoogleGenAI } from '@google/genai';

export interface ModelHealthStatus {
  modelName: string;
  displayName: string;
  status: 'active' | 'cooldown' | 'quota_exhausted' | 'degraded';
  requestsTotal: number;
  failuresTotal: number;
  lastFailureReason?: string;
  cooldownUntil?: string;
  isPrimary: boolean;
}

export interface ModelSwitchEvent {
  id: string;
  timestamp: string;
  fromModel: string;
  toModel: string;
  triggerReason: string;
}

const MODEL_POOL = [
  { name: 'gemini-2.5-flash', display: 'Gemini 2.5 Flash' },
  { name: 'gemini-3.1-flash-lite', display: 'Gemini 3.1 Flash Lite' },
  { name: 'gemini-3.8-flash', display: 'Gemini 3.8 Flash' },
];

let primaryModel = 'gemini-2.5-flash';
const cooldowns = new Map<string, number>();
const stats = new Map<string, { requests: number; failures: number; lastError?: string }>();
const switchLogs: ModelSwitchEvent[] = [];

MODEL_POOL.forEach((m) => stats.set(m.name, { requests: 0, failures: 0 }));

export function getModelStatuses(): ModelHealthStatus[] {
  const now = Date.now();
  return MODEL_POOL.map((m) => {
    const coolUntil = cooldowns.get(m.name) || 0;
    const st = stats.get(m.name) || { requests: 0, failures: 0 };
    let status: ModelHealthStatus['status'] = 'active';

    if (now < coolUntil) {
      status = 'quota_exhausted';
    } else if (st.failures > 3) {
      status = 'degraded';
    }

    return {
      modelName: m.name,
      displayName: m.display,
      status,
      requestsTotal: st.requests,
      failuresTotal: st.failures,
      lastFailureReason: st.lastError,
      cooldownUntil: coolUntil > now ? new Date(coolUntil).toISOString() : undefined,
      isPrimary: m.name === primaryModel,
    };
  });
}

export function recordModelSuccess(modelName: string) {
  const st = stats.get(modelName) || { requests: 0, failures: 0 };
  st.requests++;
  stats.set(modelName, st);
  cooldowns.delete(modelName);
}

export function recordModelFailure(modelName: string, errorMsg: string) {
  const st = stats.get(modelName) || { requests: 0, failures: 0 };
  st.requests++;
  st.failures++;
  st.lastError = errorMsg;
  stats.set(modelName, st);

  const coolUntil = Date.now() + 60_000;
  cooldowns.set(modelName, coolUntil);

  const available = MODEL_POOL.find((m) => m.name !== modelName && (cooldowns.get(m.name) || 0) <= Date.now());
  if (available && modelName === primaryModel) {
    const prev = primaryModel;
    primaryModel = available.name;
    switchLogs.unshift({
      id: `SW-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      fromModel: prev,
      toModel: available.name,
      triggerReason: `Auto-Switch akibat Quota Limit / Error: ${errorMsg.slice(0, 80)}`,
    });
    if (switchLogs.length > 30) switchLogs.pop();
  }
}

export function getSwitchLogs(): ModelSwitchEvent[] {
  return switchLogs;
}

export function setPrimaryModel(modelName: string) {
  primaryModel = modelName;
  cooldowns.delete(modelName);
}
