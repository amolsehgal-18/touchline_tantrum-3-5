import React from 'react';

interface TensionArcsProps {
  board: number;
  fans: number;
}

export const TensionArcs = ({ board, fans }: TensionArcsProps) => {
  const size = 140;
  const strokeWidth = 10;
  const center = size / 2;
  
  const drawArc = (value: number, radius: number, color: string, label: string) => {
    // Semi-circle (180 degrees) from left to right (top half)
    const circumference = Math.PI * radius;
    const dash = value * circumference;
    const gap = circumference - dash;
    
    return (
      <g key={label}>
        {/* Background Track (Top semi-circle) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active Value */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${gap + circumference}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 10px ${color}44)` }}
        />
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 5} className="overflow-visible">
        {drawArc(board, 55, "hsl(var(--primary))", "board")}
        {drawArc(fans, 40, "hsl(var(--accent))", "fans")}
      </svg>
      
      <div className="grid grid-cols-2 gap-2 text-[9px] font-headline uppercase tracking-[0.1em] opacity-90 mt-2 w-full px-1">
        <div className="flex flex-col items-center border-r border-white/10">
          <span className="text-primary font-bold">{Math.round(board * 100)}%</span>
          <span className="opacity-50 text-[7px] font-bold">Board</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-accent font-bold">{Math.round(fans * 100)}%</span>
          <span className="opacity-50 text-[7px] font-bold">Fans</span>
        </div>
      </div>
    </div>
  );
};