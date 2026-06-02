import React, { useEffect, useState } from 'react';
import { fetchAdminConfigs } from '../../utils/api';

export const CaddyPlugin = {
  id: 'caddy-manager',
  name: 'Caddy Manager',
  init: () => console.log('Caddy Manager Plugin Initialized'),
  render: () => {
    const [configs, setConfigs] = useState([]);
    useEffect(() => {
      fetchAdminConfigs().then(data => setConfigs(data.nginxConfigs));
    }, []);
    return (
      <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 shadow-neon">
        <h2 className="text-white font-mono uppercase text-xs mb-2">Caddy Reverse Proxy</h2>
        <div className="space-y-2">
          {configs.map((c: any) => (
            <div key={c.id} className="text-zinc-300 text-[10px] font-mono border-b border-zinc-800 pb-1">
              <span className="text-sky-400">{c.domainName}</span> → {c.targetUrl} 
              <span className={`ml-2 px-1 rounded ${c.isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                {c.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
};
