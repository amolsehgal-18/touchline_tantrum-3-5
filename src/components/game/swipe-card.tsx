
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
  // Color pops up much sooner (15px threshold)
  const swipeProgress = Math.min(Math.abs(dragX) / 40, 1);
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
          "w-full bg-card min-h-[380px] flex flex-col justify-between border-2 transition-all relative group shadow-2xl p-6",
          dragX < -15 ? "border-destructive shadow-[0_0_30px_rgba(239,68,68,0.3)]" : dragX > 15 ? "border-primary shadow-[0_0_30px_rgba(34,107,224,0.3)]" : "border-white/10"
        )}>
          {scenario.isBreaking && (
            <div className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-headline px-4 py-1.5 z-20 skew-x-[-15deg] font-black tracking-widest">
              URGENT
            </div>
          )}

          <div className="space-y-4">
            <div className="text-[10px] font-headline uppercase tracking-[0.3em] text-accent font-black opacity-80">Tactical Briefing</div>
            <p className="text-lg md:text-xl leading-tight font-headline font-black text-white tracking-tight">
              {scenario.scenario}
            </p>
          </div>

          <div className="mt-8 flex-1 flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-3 h-32 relative">
              {/* Left Option */}
              <div 
                className={cn(
                  "flex flex-col gap-2 p-3 rounded-lg border transition-all duration-200",
                  isLeft && dragX < -15 ? "bg-destructive border-white/40 scale-105 shadow-xl z-10" : "bg-white/5 border-transparent"
                )}
                style={{ opacity: isLeft ? 0.4 + (swipeProgress * 0.6) : 0.1 }}
              >
                <div className="flex items-center gap-1 text-white font-headline uppercase text-[12px] font-black italic tracking-tighter">
                  <ChevronLeft className="w-4 h-4" /> REJECT
                </div>
                <div className="text-[11px] font-headline text-white leading-tight font-black">
                  {scenario.leftOption}
                </div>
              </div>

              {/* Right Option */}
              <div 
                className={cn(
                  "flex flex-col gap-2 p-3 rounded-lg border text-right transition-all duration-200",
                  isRight && dragX > 15 ? "bg-primary border-white/40 scale-105 shadow-xl z-10" : "bg-white/5 border-transparent"
                )}
                style={{ opacity: isRight ? 0.4 + (swipeProgress * 0.6) : 0.1 }}
              >
                <div className="flex items-center gap-1 justify-end text-white font-headline uppercase text-[12px] font-black italic tracking-tighter">
                  APPROVE <ChevronRight className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-headline text-white leading-tight font-black">
                  {scenario.rightOption}
                </div>
              </div>
            </div>

            {Math.abs(dragX) < 15 && (
              <div className="text-center mt-6 flex items-center justify-center gap-2 animate-pulse opacity-40">
                <ChevronLeft className="w-3 h-3 text-destructive" />
                <span className="text-[9px] font-headline uppercase tracking-[0.3em] font-black">Swipe to Act</span>
                <ChevronRight className="w-3 h-3 text-primary" />
              </div>
            )}
          </div>
        </SlantedContainer>
      </div>
      
      <div className="mt-8 text-center text-[9px] font-headline uppercase tracking-[0.4em] opacity-20 font-black italic">
        The clock is ticking...
      </div>
    </div>
  );
};
