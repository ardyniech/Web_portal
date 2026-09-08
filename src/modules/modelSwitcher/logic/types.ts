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

export interface ModelSwitcherData {
  models: ModelHealthStatus[];
  switchLogs: ModelSwitchEvent[];
}
