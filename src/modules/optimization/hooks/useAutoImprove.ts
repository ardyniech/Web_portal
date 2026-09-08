import { useEffect } from 'react';
import { AutonomousOptimizer, PerformanceMetrics } from '../engine/AutonomousOptimizer';

export const useAutoImprove = (metrics: PerformanceMetrics) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      AutonomousOptimizer.analyzeAndOptimize(metrics).catch(console.error);
    }, 1000);
    return () => clearTimeout(timer);
  }, [metrics]);
};
