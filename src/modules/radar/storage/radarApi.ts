export const fetchRadarMetrics = async (): Promise<number[]> => {
  const response = await fetch('/api/radar/metrics');
  if (!response.ok) throw new Error('Failed to fetch radar metrics');
  return response.json();
};