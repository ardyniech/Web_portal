import { BoundaryReport } from '../logic/types';

export const boundaryEnforcerApi = {
  async runAudit(): Promise<BoundaryReport> {
    const res = await fetch('/api/boundary/audit');
    if (!res.ok) {
      throw new Error('Gagal menjalankan audit batasan seluler arsitektur');
    }
    return res.json();
  },
};
