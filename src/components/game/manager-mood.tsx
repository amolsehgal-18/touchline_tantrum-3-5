import React from 'react';
import { ManagerMood } from '@/lib/game-logic';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const ManagerMoodView = ({ mood }: { mood: ManagerMood }) => {
  const image = PlaceHolderImages.find(img => img.id === `manager-${mood}`) || PlaceHolderImages[1];

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Mood text placed ABOVE the photo */}
      <div className="bg-accent/20 text-accent px-4 py-1 slanted-container text-[10px] font-headline uppercase tracking-[0.3em] shadow-lg border border-accent/30 mb-2 font-bold">
        {mood}
      </div>
      <div className="relative w-28 h-28">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse-slow" />
        <div className="relative w-full h-full rounded-full border-4 border-white/5 overflow-hidden bg-black/40 shadow-2xl ring-2 ring-primary/20">
          <Image
            src={image.imageUrl}
            alt={`Manager status: ${mood}`}
            fill
            className="object-cover transition-opacity duration-700"
            data-ai-hint={image.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
      </div>
    </div>
  );
};