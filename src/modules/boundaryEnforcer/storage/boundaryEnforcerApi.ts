import { BoundaryReport, ComplexityAuditReport } from '../logic/types';

export const boundaryEnforcerApi = {
  async fetchAuditReport(): Promise<BoundaryReport> {
    const res = await fetch('/api/boundary/audit');
    if (!res.ok) throw new Error('Gagal memuat laporan batasan arsitektur');
    return res.json();
  },

  async fetchComplexityReport(): Promise<ComplexityAuditReport> {
    const res = await fetch('/api/boundary/complexity');
    if (!res.ok) throw new Error('Gagal memuat audit densitas & kompleksitas berkas');
    return res.json();
  },
};
