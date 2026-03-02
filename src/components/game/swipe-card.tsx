
"use client"

import React, { useState, useRef } from 'react';
import { AiScenarioPresentationOutput } from '@/ai/flows/ai-scenario-presentation-flow';
import { SlantedContainer } from './slanted-elements';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeCardProps {
  scenario: AiScenarioPresentationOutput;
  onDecision: (side: 'left' | 'right') => void;
}

export const SwipeCard = ({ scenario, onDecision }: SwipeCardProps) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setDragX(currentX - startXRef.current);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > 60) {
      onDecision('right');
    } else if (dragX < -60) {
      onDecision('left');
    }
    setDragX(0);
  };

  const rotation = dragX / 10;
  // Sensitivity: color pops at 15px
  const swipeProgress = Math.min(Math.abs(dragX) / 15, 1);
  const isLeft = dragX < 0;
  const isRight = dragX > 0;

  return (
    <div 
      className="relative w-full max-w-sm h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing px-4 py-2"
      onMouseMove={handleTouchMove}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="w-full transition-transform duration-200 ease-out select-none"
        style={{ 
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          touchAction: 'none'
        }}
      >
        <SlantedContainer className={cn(
          "w-full bg-card min-h-[400px] flex flex-col justify-between border-2 transition-all relative group shadow-2xl p-7",
          dragX < -15 ? "border-destructive shadow-[0_0_40px_rgba(239,68,68,0.4)]" : dragX > 15 ? "border-primary shadow-[0_0_40px_rgba(34,107,224,0.4)]" : "border-white/10"
        )}>
          {scenario.isBreaking && (
            <div className="absolute top-0 right-0 bg-destructive text-white text-[10px] font-headline px-6 py-2 z-20 skew-x-[-15deg] font-black tracking-widest uppercase">
              Urgent
            </div>
          )}

          <div className="space-y-4 pt-4">
            <p className="text-[16px] leading-snug font-headline font-bold text-white tracking-tight">
              {scenario.scenario}
            </p>
          </div>

          <div className="mt-10 flex-1 flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-4 h-36 relative">
              {/* Left Option */}
              <div 
                className={cn(
                  "flex flex-col gap-2 p-3.5 rounded-xl border transition-all duration-200",
                  isLeft && dragX < -15 ? "bg-destructive border-white/60 scale-105 shadow-2xl z-10" : "bg-white/5 border-transparent"
                )}
                // High initial opacity for visibility
                style={{ opacity: isLeft ? 0.7 + (swipeProgress * 0.3) : 0.7 }}
              >
                <div className="flex items-center gap-1.5 text-white font-headline uppercase text-[12px] font-black italic tracking-tighter">
                  <ChevronLeft className="w-4 h-4" /> REJECT
                </div>
                <div className="text-[12px] font-headline font-bold text-white leading-tight">
                  {scenario.leftOption}
                </div>
              </div>

              {/* Right Option */}
              <div 
                className={cn(
                  "flex flex-col gap-2 p-3.5 rounded-xl border text-right transition-all duration-200",
                  isRight && dragX > 15 ? "bg-primary border-white/60 scale-105 shadow-2xl z-10" : "bg-white/5 border-transparent"
                )}
                // High initial opacity for visibility
                style={{ opacity: isRight ? 0.7 + (swipeProgress * 0.3) : 0.7 }}
              >
                <div className="flex items-center gap-1.5 justify-end text-white font-headline uppercase text-[12px] font-black italic tracking-tighter">
                  APPROVE <ChevronRight className="w-4 h-4" />
                </div>
                <div className="text-[12px] font-headline font-bold text-white leading-tight">
                  {scenario.rightOption}
                </div>
              </div>
            </div>

            {Math.abs(dragX) < 15 && (
              <div className="text-center mt-8 flex items-center justify-center gap-4 animate-pulse opacity-60">
                <ChevronLeft className="w-5 h-5 text-destructive" />
                <span className="text-[11px] font-headline uppercase tracking-[0.5em] font-black">Swipe Action</span>
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
        </SlantedContainer>
      </div>
    </div>
  );
};
