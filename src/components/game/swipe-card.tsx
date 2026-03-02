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
  const opacity = Math.min(Math.abs(dragX) / 80, 1);
  const isLeft = dragX < 0;

  return (
    <div 
      className="relative w-full max-w-sm h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
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
          "w-full bg-card min-h-[380px] flex flex-col justify-between border-2 transition-colors relative",
          dragX < -50 ? "border-red-500/50" : dragX > 50 ? "border-primary/50" : "border-white/10"
        )}>
          {scenario.isBreaking && (
            <div className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-headline px-3 py-1 z-20 skew-x-[-20deg] shadow-lg">
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
            {/* Swiping Indicators: Now permanently visible but faded, highlighting on drag */}
            <div className="grid grid-cols-2 gap-4 h-24">
              <div 
                className="flex flex-col gap-1 transition-all"
                style={{ opacity: isLeft ? 0.3 + (opacity * 0.7) : 0.1 }}
              >
                <div className="flex items-center gap-1 text-red-500 font-headline uppercase text-[9px] font-bold">
                  <ChevronLeft className="w-4 h-4" /> Left
                </div>
                <div className="text-[11px] font-headline text-white/80 leading-tight">
                  {scenario.leftOption}
                </div>
              </div>

              <div 
                className="flex flex-col gap-1 text-right transition-all"
                style={{ opacity: !isLeft ? 0.3 + (opacity * 0.7) : 0.1 }}
              >
                <div className="flex items-center gap-1 justify-end text-primary font-headline uppercase text-[9px] font-bold">
                  Right <ChevronRight className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-headline text-white/80 leading-tight">
                  {scenario.rightOption}
                </div>
              </div>
            </div>

            {Math.abs(dragX) < 20 && (
              <div className="text-center mt-4 flex items-center justify-center gap-2 animate-pulse opacity-30">
                <ChevronLeft className="w-3 h-3" />
                <span className="text-[8px] font-headline uppercase tracking-widest">SWIPE TO DECIDE</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            )}
          </div>
        </SlantedContainer>
      </div>
      
      <div className="mt-6 text-center text-[8px] font-headline uppercase tracking-[0.4em] opacity-30">
        Swipe Left or Right
      </div>
    </div>
  );
};