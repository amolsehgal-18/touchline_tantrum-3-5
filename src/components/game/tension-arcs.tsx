import React from 'react';

interface TensionArcsProps {
  board: number;
  fans: number;
}

export const TensionArcs = ({ board, fans }: TensionArcsProps) => {
  const size = 160;
  const strokeWidth = 12;
  const center = size / 2;
  
  const drawArc = (value: number, radius: number, color: string, label: string) => {
    // Semi-circle (180 degrees)
    const circumference = Math.PI * radius;
    const dash = value * circumference;
    const gap = circumference - dash;
    
    return (
      <g key={label}>
        {/* Background Track */}
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
          style={{ filter: `drop-shadow(0 0 12px ${color}33)` }}
        />
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        {drawArc(board, 65, "#3b82f6", "board")}
        {drawArc(fans, 48, "#f97316", "fans")}
      </svg>
      
      <div className="grid grid-cols-2 gap-4 text-[9px] font-headline uppercase tracking-[0.2em] opacity-80 mt-2 w-full px-2">
        <div className="flex flex-col items-center border-r border-white/10">
          <span className="text-blue-400 font-bold">{Math.round(board * 100)}%</span>
          <span className="opacity-50 text-[7px]">Board</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-orange-400 font-bold">{Math.round(fans * 100)}%</span>
          <span className="opacity-50 text-[7px]">Fans</span>
        </div>
      </div>
    </div>
  );
};