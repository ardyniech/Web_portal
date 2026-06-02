import React from 'react';
import { DashboardGrid } from './DashboardGrid';

export const DashboardOrchestrator: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white">Tri-Claw Dashboard</h1>
        <p className="text-xs text-zinc-500 font-mono mt-1">Autonomous Infrastructure Monitoring</p>
      </header>
      <main>
        <DashboardGrid />
      </main>
    </div>
  );
};
