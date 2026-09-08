import { useState } from 'react';
import { ArchitecturalPlanBlueprint } from './types';
import { planApi } from '../storage/planApi';

export function useArchitecturalPlan() {
  const [plan, setPlan] = useState<ArchitecturalPlanBlueprint | null>(null);
  const [taskGoal, setTaskGoal] = useState('Refaktor Modul Autentikasi Keamanan & Skalabilitas Multi-Role');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlan = async (goal?: string) => {
    const target = goal || taskGoal;
    setLoading(true);
    setError(null);
    try {
      const data = await planApi.generatePlan(target);
      setPlan(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat rencana arsitektur');
    } finally {
      setLoading(false);
    }
  };

  return {
    plan,
    taskGoal,
    setTaskGoal,
    loading,
    error,
    createPlan,
  };
}
