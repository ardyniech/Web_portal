import React, { useState, useCallback } from 'react';
import { computeSystemHealthSummary, getSystemHealthTimeSeries } from '../logic/systemHealthEngine';
import { HealthChart } from './HealthChart';
import { OsvAuditPanel } from '../../osvAudit';
import { MemoryFragmentationOverlay } from './MemoryFragmentationOverlay';
import { Button } from '../../../shared/atoms/Button';
import { Activity, Zap, Cpu, Sparkles, X, RefreshCw, ShieldAlert } from 'lucide-react';

interface SystemHealthModalProps { onClose: () => void; }

const HealthHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-between border-b pb-2.5">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-emerald-100 rounded-lg"><Activity className="w-4 h-4" /></div>
      <div><h3 className="text-xs font-bold">System Health</h3></div>
    </div>
    <button onClick={onClose}><X className="w-4 h-4" /></button>
  </div>
);

export function SystemHealthModal({ onClose }: SystemHealthModalProps) {
  const [summary, setSummary] = useState(computeSystemHealthSummary());
  const [timeSeries, setTimeSeries] = useState(getSystemHealthTimeSeries());
  const [activeTab, setActiveTab] = useState<'latency' | 'token' | 'improvement' | 'osv'>('latency');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    try {
      setIsRefreshing(true);
      setTimeout(() => {
        setSummary(computeSystemHealthSummary());
        setTimeSeries(getSystemHealthTimeSeries());
        setIsRefreshing(false);
      }, 300);
    } catch (e) {
      console.error('[Module:SystemHealth] Error in refresh:', e);
      setIsRefreshing(false);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-4">
        <HealthHeader onClose={onClose} />
        <MemoryFragmentationOverlay />
        {activeTab === 'osv' ? <OsvAuditPanel /> : <HealthChart data={timeSeries} metricKey="latencyMs" color="#6366f1" />}
        <Button onClick={handleRefresh}>Refresh</Button>
      </div>
    </div>
  );
}