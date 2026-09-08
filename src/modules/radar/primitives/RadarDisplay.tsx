import React from 'react';

export const RadarDisplay: React.FC<{ data: number[] }> = ({ data }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <polygon 
      points={data.map((v, i) => `${50 + 40 * v * Math.cos(i * 2 * Math.PI / data.length)},${50 + 40 * v * Math.sin(i * 2 * Math.PI / data.length)}`).join(' ')}
      className="fill-blue-500/20 stroke-blue-500"
    />
  </svg>
);