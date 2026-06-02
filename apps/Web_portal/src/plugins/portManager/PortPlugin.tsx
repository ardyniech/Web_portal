import React, { useEffect, useState, useCallback } from 'react';
import { fetchListeningPorts } from '../../utils/api';
import { EmptyState } from '../../components/EmptyState';
import { RefreshCw } from 'lucide-react';

const SERVICE_MAP: Record<string, string> = {
  '56235': 'Orchestra Gateway',
  '56234': 'Caddy Proxy',
  '22': 'SSH Access',
  '80': 'HTTP',
  '443': 'HTTPS',
};

export const PortPlugin = {
  id: 'port-manager',
  name: 'Port Manager',
  init: () => console.log('Port Manager Plugin Initialized'),
  render: () => {
    const [ports, setPorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadPorts = useCallback(async () => {
      setLoading(true);
      try {
        const res: any = await fetchListeningPorts();
        setPorts(res.ports);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => { loadPorts(); }, [loadPorts]);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-zinc-500">Service Map & PID</span>
            <button onClick={loadPorts} className="p-1 hover:bg-zinc-800 rounded transition-colors">
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
        {ports.length === 0 ? (
          <EmptyState message="No ports detected" />
        ) : (
          ports.map((p: any) => (
            <div key={p.port} className="flex justify-between items-center text-xs font-mono border-b border-zinc-800 pb-2">
              <div>
                <span className="text-sky-400 font-bold">{p.port}</span>
                <span className="text-zinc-500 ml-2">{p.protocol.toUpperCase()}</span>
              </div>
              <div className="text-right">
                <div className="text-white text-[10px]">{SERVICE_MAP[p.port] || 'Unknown Service'}</div>
                <div className="text-zinc-500 text-[9px]">{p.process}</div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
};
