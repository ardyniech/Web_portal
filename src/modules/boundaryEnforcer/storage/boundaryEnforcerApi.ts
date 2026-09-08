import { z } from 'zod';
import { BoundaryReport, ComplexityAuditReport } from '../logic/types';
import { authService } from '../../auth/authService'; // Asumsi service otorisasi standar

// Schema Definitions
const BoundaryReportSchema = z.object({
  id: z.string(),
  status: z.enum(['compliant', 'violated']),
  violations: z.array(z.string()),
  timestamp: z.string().datetime(),
}) satisfies z.ZodType<BoundaryReport>;

const ComplexityReportSchema = z.object({
  fileCount: z.number().int().nonnegative(),
  averageComplexity: z.number().min(0),
  criticalFiles: z.array(z.string()),
}) satisfies z.ZodType<ComplexityAuditReport>;

const logger = {
  error: (msg: string, err: unknown) => console.error(`[Module:BoundaryEnforcer] ${msg}`, err),
};

/**
 * Middleware internal untuk validasi akses sebelum request ke backend
 */
const authorizeAccess = async (requiredRole: 'admin' | 'auditor') => {
  const isAuthorized = await authService.hasRole(requiredRole);
  if (!isAuthorized) {
    throw new Error('SEC-401: Unauthorized access to architectural audit data');
  }
};

export const boundaryEnforcerApi = {
  async fetchAuditReport(): Promise<BoundaryReport> {
    try {
      await authorizeAccess('auditor');
      
      const res = await fetch('/api/boundary/audit', {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      
      const data = await res.json();
      return BoundaryReportSchema.parse(data);
    } catch (err) {
      logger.error('fetchAuditReport access denied or failed', err);
      throw new Error('Gagal memuat laporan batasan arsitektur');
    }
  },

  async fetchComplexityReport(): Promise<ComplexityAuditReport> {
    try {
      await authorizeAccess('admin');
      
      const res = await fetch('/api/boundary/complexity', {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      
      const data = await res.json();
      return ComplexityReportSchema.parse(data);
    } catch (err) {
      logger.error('fetchComplexityReport access denied or failed', err);
      throw new Error('Gagal memuat audit densitas & kompleksitas berkas');
    }
  },
};