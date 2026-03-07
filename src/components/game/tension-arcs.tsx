"use client"

import React from 'react';

interface TensionArcsProps {
  board: number;
  fans: number;
  dressing: number;
}

export const TensionArcs = ({ board, fans, dressing }: TensionArcsProps) => {
  const size = 130;
  const center = size / 2;
  const strokeWidth = 9;
  const radii = [52, 38, 24]; // board outer, fans middle, dressing inner
  const colors = ['hsl(var(--primary))', '#ef4444', 'hsl(var(--accent))'];
  const values = [board, fans, dressing];
  const labels = ['Board', 'Fans', 'Dressing'];

  const drawArc = (value: number, radius: number, color: string, label: string) => {
    const circumference = Math.PI * radius;
    const dash = value * circumference;
    const gap = circumference - dash;
    const pathData = `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`;

    return (
      <g key={label}>
        <path d={pathData} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${gap + circumference}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 5px ${color}66)` }}
        />
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 12} className="overflow-visible">
        {radii.map((r, i) => drawArc(values[i], r, colors[i], labels[i]))}
      </svg>
      <div className="grid grid-cols-3 gap-1 text-center mt-1 w-full">
        {values.map((v, i) => (
          <div key={labels[i]} className="flex flex-col items-center">
            <span className="text-[11px] font-headline font-black" style={{ color: colors[i] }}>
              {Math.round(v * 100)}%
            </span>
            <span className="text-[8px] font-headline uppercase tracking-widest text-white/40 font-bold">
              {labels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
