import React from 'react';

interface TensionArcsProps {
  board: number;
  fans: number;
  morale: number;
}

export const TensionArcs = ({ board, fans, morale }: TensionArcsProps) => {
  const size = 160;
  const strokeWidth = 10;
  const center = size / 2;
  
  const drawArc = (value: number, radius: number, color: string) => {
    // Semi-circle circumference is PI * radius
    const circumference = Math.PI * radius;
    const dash = value * circumference;
    const gap = circumference - dash;
    
    return (
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        // Rotate 180 to start from the left side of a top-half semi-circle
        transform={`rotate(180 ${center} ${center})`}
        className="transition-all duration-1000 ease-out opacity-80"
      />
    );
  };

  const drawBackground = (radius: number) => (
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke="rgba(255,255,255,0.05)"
      strokeWidth={strokeWidth}
      strokeDasharray={`${Math.PI * radius} ${Math.PI * radius}`}
      transform={`rotate(180 ${center} ${center})`}
    />
  );

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size / 2 + 30 }}>
      <svg width={size} height={size / 2 + strokeWidth} className="overflow-visible">
        {/* Board Support Arc (Outer) */}
        {drawBackground(60)}
        {drawArc(board, 60, "#3b82f6")}
        
        {/* Fan Support Arc (Middle) */}
        {drawBackground(45)}
        {drawArc(fans, 45, "#f97316")}
        
        {/* Dressing Room Arc (Inner) */}
        {drawBackground(30)}
        {drawArc(morale, 30, "#22c55e")}
      </svg>
      
      <div className="flex justify-center gap-2 text-[8px] font-headline uppercase tracking-tighter opacity-60 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>Board</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          <span>Fans</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span>Squad</span>
        </div>
      </div>
    </div>
  );
};
