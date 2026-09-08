import React, { useState, useCallback, useMemo } from 'react';
import { computeSystemHealthSummary, getSystemHealthTimeSeries } from '../logic/systemHealthEngine';
import { HealthChart } from './HealthChart';
import { OsvAuditPanel } from '../../osvAudit';
import { MemoryFragmentationOverlay } from './MemoryFragmentationOverlay';
import { Button } from '../../../shared/atoms/Button';
import { Activity, X } from 'lucide-react';

interface SystemHealthModalProps { onClose: () => void; }

const HealthHeader = React.memo(({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-between border-b pb-2.5">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-emerald-100 rounded-lg"><Activity className="w-4 h-4" /></div>
      <h3 className="text-xs font-bold">System Health</h3>
    </div>
    <button onClick={onClose} aria-label="Close" className="hover:bg-gray-100 p-1 rounded"><X className="w-4 h-4" /></button>
  </div>
));

export function SystemHealthModal({ onClose }: SystemHealthModalProps) {
  const [summary, setSummary] = useState(computeSystemHealthSummary);
  const [timeSeries, setTimeSeries] = useState(getSystemHealthTimeSeries);
  const [activeTab, setActiveTab] = useState<'latency' | 'osv'>('latency');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    try {
      requestAnimationFrame(() => {
        try {
          setSummary(computeSystemHealthSummary());
          setTimeSeries(getSystemHealthTimeSeries());
        } catch (err) {
          console.error('[Module:SystemHealth] Error in compute metrics:', err);
        } finally {
          setIsRefreshing(false);
        }
      });
    } catch (err) {
      console.error('[Module:SystemHealth] Error in handleRefresh execution:', err);
      setIsRefreshing(false);
    }
  }, []);

  const content = useMemo(() => {
    try {
      return activeTab === 'osv' ? <OsvAuditPanel /> : <HealthChart data={timeSeries} metricKey="latencyMs" color="#6366f1" unit="ms" />;
    } catch (err) {
      console.error('[Module:SystemHealth] Error rendering tab content:', err);
      return <div className="text-red-500 text-xs">Failed to load module content.</div>;
    }
  }, [activeTab, timeSeries]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-4 shadow-xl">
        <HealthHeader onClose={onClose} />
        <MemoryFragmentationOverlay />
        <div className="py-4">{content}</div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </div>
    </div>
  );
}