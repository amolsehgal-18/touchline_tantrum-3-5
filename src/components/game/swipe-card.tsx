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

    if (dragX > 100) {
      onDecision('right');
    } else if (dragX < -100) {
      onDecision('left');
    }
    setDragX(0);
  };

  const rotation = dragX / 10;
  const swipeProgress = Math.min(Math.abs(dragX) / 100, 1);
  const isLeft = dragX < 0;

  return (
    <div 
      className="relative w-full max-w-sm h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing px-2 py-4"
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
          "w-full bg-card min-h-[400px] flex flex-col justify-between border-2 transition-all relative group shadow-2xl",
          dragX < -50 ? "border-destructive shadow-[0_0_40px_rgba(239,68,68,0.4)]" : dragX > 50 ? "border-primary shadow-[0_0_40px_rgba(34,107,224,0.4)]" : "border-white/10"
        )}>
          {scenario.isBreaking && (
            <div className="absolute top-0 right-0 bg-destructive text-white text-[9px] font-headline px-4 py-1.5 z-20 skew-x-[-20deg] shadow-lg font-black tracking-widest">
              BREAKING
            </div>
          )}

          <div className="space-y-6">
            <div className="text-[10px] font-headline uppercase tracking-[0.4em] text-accent font-black">TACTICAL BRIEFING</div>
            <p className="text-2xl leading-tight font-headline font-black text-white tracking-tight drop-shadow-sm">
              {scenario.scenario}
            </p>
          </div>

          <div className="mt-12 flex-1 flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-4 h-40 relative overflow-visible">
              {/* Left Option Container */}
              <div 
                className={cn(
                  "flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300",
                  isLeft ? "bg-destructive/40 border-destructive/80 scale-110 shadow-lg" : "bg-white/5 border-transparent opacity-20"
                )}
                style={{ 
                  opacity: isLeft ? 0.7 + (swipeProgress * 0.3) : 0.05
                }}
              >
                <div className="flex items-center gap-1 text-destructive font-headline uppercase text-[14px] font-black italic tracking-tighter">
                  <ChevronLeft className="w-5 h-5" /> REJECT
                </div>
                <div className="text-sm font-headline text-white leading-tight font-black tracking-tight drop-shadow-lg">
                  {scenario.leftOption}
                </div>
              </div>

              {/* Right Option Container */}
              <div 
                className={cn(
                  "flex flex-col gap-3 p-4 rounded-xl border text-right transition-all duration-300",
                  !isLeft && dragX > 0 ? "bg-primary/40 border-primary/80 scale-110 shadow-lg" : "bg-white/5 border-transparent opacity-20"
                )}
                style={{ 
                  opacity: !isLeft && dragX > 0 ? 0.7 + (swipeProgress * 0.3) : 0.05
                }}
              >
                <div className="flex items-center gap-1 justify-end text-primary font-headline uppercase text-[14px] font-black italic tracking-tighter">
                  APPROVE <ChevronRight className="w-5 h-5" />
                </div>
                <div className="text-sm font-headline text-white leading-tight font-black tracking-tight drop-shadow-lg">
                  {scenario.rightOption}
                </div>
              </div>
            </div>

            {Math.abs(dragX) < 20 && (
              <div className="text-center mt-8 flex items-center justify-center gap-3 animate-pulse opacity-50">
                <ChevronLeft className="w-4 h-4 text-destructive" />
                <span className="text-[10px] font-headline uppercase tracking-[0.4em] font-black text-white">Swipe to Decide</span>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        </SlantedContainer>
      </div>
      
      <div className="mt-10 text-center text-[10px] font-headline uppercase tracking-[0.6em] opacity-30 font-black italic text-white/50">
        THE CLOCK IS TICKING...
      </div>
    </div>
  );
};
