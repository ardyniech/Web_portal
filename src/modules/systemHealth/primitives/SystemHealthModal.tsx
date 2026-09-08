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
    <button onClick={onClose} aria-label="Close"><X className="w-4 h-4" /></button>
  </div>
));

export function SystemHealthModal({ onClose }: SystemHealthModalProps) {
  const [summary, setSummary] = useState(() => computeSystemHealthSummary());
  const [timeSeries, setTimeSeries] = useState(() => getSystemHealthTimeSeries());
  const [activeTab, setActiveTab] = useState<'latency' | 'osv'>('latency');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    try {
      setIsRefreshing(true);
      requestAnimationFrame(() => {
        setSummary(computeSystemHealthSummary());
        setTimeSeries(getSystemHealthTimeSeries());
        setIsRefreshing(false);
      });
    } catch (e) {
      console.error('[Module:SystemHealth] Error in handleRefresh:', e);
      setIsRefreshing(false);
    }
  }, []);

  const content = useMemo(() => (
    activeTab === 'osv' ? <OsvAuditPanel /> : <HealthChart data={timeSeries} metricKey="latencyMs" color="#6366f1" />
  ), [activeTab, timeSeries]);

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