import React from 'react';

interface TensionArcsProps {
  board: number;
  fans: number;
  morale: number;
}

export const TensionArcs = ({ board, fans, morale }: TensionArcsProps) => {
  const size = 180;
  const strokeWidth = 8;
  const center = size / 2;
  
  const drawArc = (value: number, radius: number, color: string, id: string) => {
    // Semi-circle (top half)
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
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          transform={`rotate(180 ${center} ${center})`}
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
          className="transition-all duration-1000 ease-out shadow-lg"
          style={{ filter: `drop-shadow(0 0 5px ${color}44)` }}
        />
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        {drawArc(board, 70, "#3b82f6", "board")}
        {drawArc(fans, 55, "#f97316", "fans")}
        {drawArc(morale, 40, "#22c55e", "morale")}
      </svg>
      
      <div className="grid grid-cols-3 gap-3 text-[7px] font-headline uppercase tracking-widest opacity-60 mt-4 w-full">
        <div className="flex flex-col items-center gap-1 border-r border-white/10">
          <span className="text-blue-400 font-bold">{Math.round(board * 100)}%</span>
          <span className="opacity-50">Board</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-r border-white/10">
          <span className="text-orange-400 font-bold">{Math.round(fans * 100)}%</span>
          <span className="opacity-50">Fans</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-green-400 font-bold">{Math.round(morale * 100)}%</span>
          <span className="opacity-50">Squad</span>
        </div>
      </div>
    </div>
  );
};
