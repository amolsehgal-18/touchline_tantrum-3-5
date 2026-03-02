"use client"

import React from 'react';

interface TensionArcsProps {
  board: number;
  fans: number;
}

export const TensionArcs = ({ board, fans }: TensionArcsProps) => {
  const size = 110;
  const strokeWidth = 8;
  const center = size / 2;
  
  const drawArc = (value: number, radius: number, color: string, label: string) => {
    const circumference = Math.PI * radius;
    const dash = value * circumference;
    const gap = circumference - dash;
    
    const pathData = `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`;

    return (
      <g key={label}>
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${gap + circumference}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 5px ${color}44)` }}
        />
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center bg-transparent" style={{ width: size }}>
      <svg width={size} height={size / 2 + 5} className="overflow-visible">
        {drawArc(board, 45, "hsl(var(--primary))", "board")}
        {drawArc(fans, 32, "#ef4444", "fans")}
      </svg>
      
      <div className="grid grid-cols-2 gap-2 text-[9px] font-headline uppercase tracking-wider mt-1 w-full px-1">
        <div className="flex flex-col items-center border-r border-white/5">
          <span className="text-primary font-black">{Math.round(board * 100)}%</span>
          <span className="opacity-30 text-[7px] font-black">Board</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[#ef4444] font-black">{Math.round(fans * 100)}%</span>
          <span className="opacity-30 text-[7px] font-black">Fans</span>
        </div>
      </div>
    </div>
  );
};