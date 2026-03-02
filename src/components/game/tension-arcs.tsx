
"use client"

import React from 'react';

interface TensionArcsProps {
  board: number;
  fans: number;
}

export const TensionArcs = ({ board, fans }: TensionArcsProps) => {
  const size = 120;
  const strokeWidth = 10;
  const center = size / 2;
  
  const drawArc = (value: number, radius: number, color: string, label: string) => {
    // Top semi-circle only (180 degrees)
    // Starting from 180deg (left) to 0deg (right)
    const circumference = Math.PI * radius;
    const dash = value * circumference;
    const gap = circumference - dash;
    
    // Path for top semi-circle: Move to (center-radius, center), Arc to (center+radius, center)
    const pathData = `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`;

    return (
      <g key={label}>
        {/* Background Track */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active Value */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${gap + circumference}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        {drawArc(board, 50, "hsl(var(--primary))", "board")}
        {drawArc(fans, 35, "hsl(var(--accent))", "fans")}
      </svg>
      
      <div className="grid grid-cols-2 gap-3 text-[10px] font-headline uppercase tracking-wider mt-2 w-full px-1">
        <div className="flex flex-col items-center border-r border-white/10 pr-2">
          <span className="text-primary font-black">{Math.round(board * 100)}%</span>
          <span className="opacity-40 text-[7px] font-black">Board</span>
        </div>
        <div className="flex flex-col items-center pl-2">
          <span className="text-accent font-black">{Math.round(fans * 100)}%</span>
          <span className="opacity-40 text-[7px] font-black">Fans</span>
        </div>
      </div>
    </div>
  );
};
