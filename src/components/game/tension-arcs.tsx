
import React from 'react';

interface TensionArcsProps {
  board: number;
  fans: number;
}

export const TensionArcs = ({ board, fans }: TensionArcsProps) => {
  const size = 140;
  const strokeWidth = 10;
  const center = size / 2;
  
  const drawArc = (value: number, radius: number, color: string, id: string) => {
    // Semi-circle top half only
    const circumference = Math.PI * radius;
    const dash = value * circumference;
    const gap = circumference - dash;
    
    return (
      <g key={id}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          transform={`rotate(180 ${center} ${center})`}
          strokeLinecap="round"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(180 ${center} ${center})`}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
        />
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 5} className="overflow-visible">
        {drawArc(board, 55, "#3b82f6", "board")}
        {drawArc(fans, 40, "#f97316", "fans")}
      </svg>
      
      <div className="grid grid-cols-2 gap-2 text-[8px] font-headline uppercase tracking-widest opacity-60 mt-2 w-full px-2">
        <div className="flex flex-col items-center border-r border-white/10">
          <span className="text-blue-400 font-bold">{Math.round(board * 100)}%</span>
          <span className="opacity-50 text-[6px]">Board</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-orange-400 font-bold">{Math.round(fans * 100)}%</span>
          <span className="opacity-50 text-[6px]">Fans</span>
        </div>
      </div>
    </div>
  );
};
