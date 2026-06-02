import React, { useEffect, useState } from 'react';
import { fetchSecurityStatus } from '../../utils/api';

export const SecurityAuditPlugin = {
  id: 'security-audit',
  name: 'Security Audit',
  init: () => console.log('Security Audit Plugin Initialized'),
  render: () => {
    const [status, setStatus] = useState<any>(null);
    useEffect(() => {
      fetchSecurityStatus().then(setStatus);
    }, []);
    
    if (!status) return null;

    const isSecure = status.totalExposed === 0;

    return (
      <div className={`p-4 rounded-lg border shadow-neon ${isSecure ? 'bg-zinc-900 border-zinc-800' : 'bg-red-950/20 border-red-900'}`}>
        <h2 className={`font-mono uppercase text-xs mb-2 ${isSecure ? 'text-white' : 'text-red-400'}`}>
          {isSecure ? 'Security Status: Secure' : 'Security Status: Alert'}
        </h2>
        {isSecure ? (
          <p className="text-[10px] text-green-400">Tidak ada port publik yang berisiko.</p>
        ) : (
          <div className="text-[10px] text-red-300">
            {status.insecurePorts.map((p: any) => (
              <div key={p.port}>{p.protocol.toUpperCase()}/{p.port} - {p.reason}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
};
