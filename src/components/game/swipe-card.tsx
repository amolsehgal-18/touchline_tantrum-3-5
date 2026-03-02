
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
      className="relative w-full max-w-sm h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing px-2"
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
          "w-full bg-card min-h-[380px] flex flex-col justify-between border-2 transition-all relative group",
          dragX < -50 ? "border-destructive shadow-[0_0_20px_rgba(239,68,68,0.2)]" : dragX > 50 ? "border-primary shadow-[0_0_20px_rgba(34,107,224,0.2)]" : "border-white/10"
        )}>
          {scenario.isBreaking && (
            <div className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-headline px-3 py-1 z-20 skew-x-[-20deg] shadow-lg font-bold">
              BREAKING
            </div>
          )}

          <div className="space-y-4">
            <div className="text-[10px] font-headline uppercase tracking-[0.3em] opacity-40">Tactical Briefing</div>
            <p className="text-xl leading-tight font-headline font-bold text-white tracking-tight">
              {scenario.scenario}
            </p>
          </div>

          <div className="mt-8 flex-1 flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-4 h-32 relative overflow-visible">
              {/* Left Option Container */}
              <div 
                className={cn(
                  "flex flex-col gap-2 p-3 rounded-lg border transition-all duration-200",
                  isLeft ? "bg-destructive/20 border-destructive/40" : "bg-white/5 border-transparent opacity-20"
                )}
                style={{ 
                  transform: isLeft ? `scale(${1 + swipeProgress * 0.1})` : 'scale(1)',
                  opacity: isLeft ? 0.4 + (swipeProgress * 0.6) : 0.1
                }}
              >
                <div className="flex items-center gap-1 text-destructive font-headline uppercase text-[10px] font-black italic">
                  <ChevronLeft className="w-4 h-4" /> REJECT
                </div>
                <div className="text-xs font-headline text-white leading-tight font-bold tracking-tight">
                  {scenario.leftOption}
                </div>
              </div>

              {/* Right Option Container */}
              <div 
                className={cn(
                  "flex flex-col gap-2 p-3 rounded-lg border text-right transition-all duration-200",
                  !isLeft && dragX > 0 ? "bg-primary/20 border-primary/40" : "bg-white/5 border-transparent opacity-20"
                )}
                style={{ 
                  transform: !isLeft && dragX > 0 ? `scale(${1 + swipeProgress * 0.1})` : 'scale(1)',
                  opacity: !isLeft && dragX > 0 ? 0.4 + (swipeProgress * 0.6) : 0.1
                }}
              >
                <div className="flex items-center gap-1 justify-end text-primary font-headline uppercase text-[10px] font-black italic">
                  APPROVE <ChevronRight className="w-4 h-4" />
                </div>
                <div className="text-xs font-headline text-white leading-tight font-bold tracking-tight">
                  {scenario.rightOption}
                </div>
              </div>
            </div>

            {Math.abs(dragX) < 20 && (
              <div className="text-center mt-6 flex items-center justify-center gap-2 animate-pulse opacity-40">
                <ChevronLeft className="w-4 h-4 text-destructive" />
                <span className="text-[9px] font-headline uppercase tracking-[0.3em] font-black">Swipe to Decide</span>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        </SlantedContainer>
      </div>
      
      <div className="mt-8 text-center text-[9px] font-headline uppercase tracking-[0.5em] opacity-30 font-black italic">
        The clock is ticking...
      </div>
    </div>
  );
};
