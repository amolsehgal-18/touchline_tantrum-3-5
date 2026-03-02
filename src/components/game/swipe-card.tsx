"use client"

import React, { useState, useRef, useEffect } from 'react';
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
  const containerWidth = 320; // Approx card width

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
  const opacity = Math.min(Math.abs(dragX) / 100, 1);
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
          "w-full bg-card min-h-[400px] flex flex-col justify-between border-2 transition-colors",
          dragX < -50 ? "border-red-500/50" : dragX > 50 ? "border-primary/50" : "border-white/10"
        )}>
          {scenario.isBreaking && (
            <div className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-headline px-3 py-1 z-20 skew-x-[-20deg] shadow-lg">
              BREAKING
            </div>
          )}

          <div className="space-y-6">
            <div className="text-[10px] font-headline uppercase tracking-[0.3em] opacity-40">Tactical Briefing</div>
            <p className="text-xl leading-relaxed font-headline font-bold text-white tracking-tight">
              {scenario.scenario}
            </p>
          </div>

          <div className="relative h-24 flex items-center justify-center">
            {/* Visual Indicators for Swipe */}
            <div 
              className="absolute left-0 flex flex-col items-start gap-2 transition-opacity"
              style={{ opacity: isLeft ? opacity : 0.1 }}
            >
              <div className="flex items-center gap-2 text-red-500 font-headline uppercase text-[10px] font-bold">
                <ChevronLeft className="w-4 h-4" /> Swipe Left
              </div>
              <div className="text-[12px] font-headline text-white/60 max-w-[120px] leading-tight">
                {scenario.leftOption}
              </div>
            </div>

            <div 
              className="absolute right-0 flex flex-col items-end gap-2 text-right transition-opacity"
              style={{ opacity: !isLeft ? opacity : 0.1 }}
            >
              <div className="flex items-center gap-2 text-primary font-headline uppercase text-[10px] font-bold">
                Swipe Right <ChevronRight className="w-4 h-4" />
              </div>
              <div className="text-[12px] font-headline text-white/60 max-w-[120px] leading-tight">
                {scenario.rightOption}
              </div>
            </div>

            {Math.abs(dragX) < 20 && (
              <div className="flex gap-1 animate-bounce opacity-20">
                <ChevronLeft className="w-4 h-4" />
                <div className="text-[8px] font-headline uppercase tracking-widest">Decision Required</div>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </SlantedContainer>
      </div>
      
      <div className="mt-8 text-center text-[8px] font-headline uppercase tracking-[0.4em] opacity-30">
        Swipe Left or Right to Decide
      </div>
    </div>
  );
};
