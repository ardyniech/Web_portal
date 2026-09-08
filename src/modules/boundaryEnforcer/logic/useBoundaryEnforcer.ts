import { useState, useEffect } from 'react';
import { BoundaryReport, ComplexityAuditReport } from './types';
import { boundaryEnforcerApi } from '../storage/boundaryEnforcerApi';
import { dispatcher } from '../../../core/dispatcher';

export function useBoundaryEnforcer() {
  const [report, setReport] = useState<BoundaryReport | null>(null);
  const [complexityReport, setComplexityReport] = useState<ComplexityAuditReport | null>(null);
  const [activeTab, setActiveTab] = useState<'boundaries' | 'complexity'>('boundaries');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await boundaryEnforcerApi.fetchAuditReport();
      setReport(data);
      const comp = await boundaryEnforcerApi.fetchComplexityReport();
      setComplexityReport(comp);
    } catch (err: any) {
      setError(err?.message || 'Gagal menjalankan boundary audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
    const unsub = dispatcher.on('git:status_updated', () => runAudit());
    return () => unsub();
  }, []);

  return {
    report,
    complexityReport,
    activeTab,
    setActiveTab,
    loading,
    error,
    refresh: runAudit,
  };
}
