export interface PerformanceMetrics {
  latency: number;
  memoryUsage: number;
  errorRate: number;
  timestamp: number;
}

export interface OptimizationConfig {
  cacheTtl: number;
  poolSize: number;
  strategy: 'aggressive' | 'conservative';
}