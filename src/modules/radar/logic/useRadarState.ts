import { useState, useEffect } from 'react';
import { fetchRadarMetrics } from '../storage/radarApi';

export const useRadarState = () => {
  const [metrics, setMetrics] = useState<number[]>([]);
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchRadarMetrics();
      setMetrics(data);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return { metrics };
};