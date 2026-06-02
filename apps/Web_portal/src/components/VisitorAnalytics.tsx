import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

export function VisitorAnalytics({ locale = 'id' }: { locale?: 'en' | 'id' }) {
  const [gaId, setGaId] = useState(localStorage.getItem('ga_measurement_id') || import.meta.env.VITE_GA_MEASUREMENT_ID);

  useEffect(() => {
    const checkGaId = () => {
        setGaId(localStorage.getItem('ga_measurement_id') || import.meta.env.VITE_GA_MEASUREMENT_ID);
    };
    window.addEventListener('storage', checkGaId);
    return () => window.removeEventListener('storage', checkGaId);
  }, []);
  
  const isId = locale === 'id';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="bg-zinc-950 p-6 rounded-3xl text-white shadow-neon border border-zinc-900 group hover:shadow-neon-strong transition-all duration-500"
    >
       <div className="flex items-center gap-3 mb-4 opacity-80">
         <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sky-400 group-hover:animate-pulse shadow-neon">
           <Users size={16} className="drop-shadow-neon" />
         </div>
         <span className="text-xs font-bold uppercase tracking-widest font-mono text-zinc-400 drop-shadow-neon">
           {isId ? 'Analisis Node' : 'Node Analytics'}
         </span>
       </div>
       <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                {isId ? 'Lalu Lintas Jaringan' : 'Network Traffic'}
              </div>
              <div className="text-sm text-zinc-300">
                  Status: <span className={`font-semibold ${gaId ? 'text-emerald-400' : 'text-zinc-500'}`}>{gaId ? (isId ? 'AKTIF' : 'ACTIVE') : (isId ? 'OFFLINE' : 'OFFLINE')}</span>
              </div>
            </div>
            <div className="flex gap-1 items-end h-8">
               {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1.0, 0.7, 0.5].map((h, i) => (
                 <motion.div 
                   key={i}
                   initial={{ height: "20%" }}
                   animate={{ height: `${h * 100}%` }}
                   transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1, ease: "easeInOut" }}
                   className={`w-1 rounded-full ${gaId ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`}
                 />
               ))}
            </div>
       </div>
       <div className="mt-3 flex items-center justify-between px-1">
           <div className="text-[9px] text-zinc-600 font-mono tracking-tighter">GATEWAY_ID: {gaId ? 'G-CONFIGURED' : 'NULL_VOID'}</div>
           <div className="text-[9px] text-zinc-500 font-bold tracking-tighter uppercase">
             {gaId ? (isId ? 'Mengumpulkan Sinyal' : 'Collecting Telemetry') : (isId ? 'Menanti Masukan Ingress' : 'Awaiting Ingress')}
           </div>
       </div>
    </motion.div>
  );
}
