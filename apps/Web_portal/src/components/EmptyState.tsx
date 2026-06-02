import React from 'react';

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-6 text-zinc-600">
    <div className="text-2xl mb-2">🎌</div>
    <p className="text-[10px] font-mono uppercase tracking-widest">{message}</p>
  </div>
);
