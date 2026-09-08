import { z } from 'zod';
import { BoundaryReport, ComplexityAuditReport } from '../logic/types';

// Schema Definitions (Ensure these match the actual API contract)
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

export const boundaryEnforcerApi = {
  async fetchAuditReport(): Promise<BoundaryReport> {
    try {
      const res = await fetch('/api/boundary/audit');
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      
      const data = await res.json();
      return BoundaryReportSchema.parse(data);
    } catch (err) {
      logger.error('fetchAuditReport failed validation or network', err);
      throw new Error('Gagal memuat laporan batasan arsitektur yang valid');
    }
  },

  async fetchComplexityReport(): Promise<ComplexityAuditReport> {
    try {
      const res = await fetch('/api/boundary/complexity');
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      
      const data = await res.json();
      return ComplexityReportSchema.parse(data);
    } catch (err) {
      logger.error('fetchComplexityReport failed validation or network', err);
      throw new Error('Gagal memuat audit densitas & kompleksitas berkas yang valid');
    }
  },
};