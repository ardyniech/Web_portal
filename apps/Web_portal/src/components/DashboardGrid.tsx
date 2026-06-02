import React, { useState } from 'react';
import { pluginManager } from '../plugins/pluginManager';

export const DashboardGrid = () => {
  const plugins = pluginManager.getPlugins().filter(p => p.render);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {plugins.map(p => (
        <div 
          key={p.id} 
          className="group bg-zinc-950/50 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden transition-all duration-300 hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)]"
        >
          <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest group-hover:text-sky-400 transition-colors">
              {p.name}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="p-4">
            {p.render && p.render()}
          </div>
        </div>
      ))}
    </div>
  );
};
