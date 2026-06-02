import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '10:00', load: 30 },
  { name: '10:05', load: 45 },
  { name: '10:10', load: 25 },
  { name: '10:15', load: 60 },
  { name: '10:20', load: 40 },
  { name: '10:25', load: 80 },
  { name: '10:30', load: 50 },
];

export function SystemMonitor({ locale = 'id' }: { locale?: 'en' | 'id' }) {
  const isId = locale === 'id';
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 shadow-[0_0_15px_rgba(14,165,233,0.05)]">
      <h3 className="text-zinc-400 text-xs font-mono mb-4 uppercase tracking-wider">
        {isId ? 'Beban Komputer Gateway (ms)' : 'Gateway Load (ms)'}
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#52525b" fontSize={10} />
            <YAxis stroke="#52525b" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }}
              itemStyle={{ color: '#0ea5e9' }}
            />
            <Area type="monotone" dataKey="load" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorLoad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
