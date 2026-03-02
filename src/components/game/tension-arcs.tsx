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
    <div className="relative" style={{ width: size, height: size / 1.5 }}>
      <svg width={size} height={size}>
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
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-[8px] font-headline uppercase tracking-tighter opacity-60">
        <span className="text-blue-400">Board</span>
        <span className="text-orange-400">Fans</span>
        <span className="text-green-400">Morale</span>
      </div>
    </div>
  );
};
