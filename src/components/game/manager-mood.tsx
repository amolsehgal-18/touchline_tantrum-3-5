import React from 'react';
import { ManagerMood } from '@/lib/game-logic';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const ManagerMoodView = ({ mood }: { mood: ManagerMood }) => {
  const image = PlaceHolderImages.find(img => img.id === `manager-${mood}`) || PlaceHolderImages[1];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="bg-accent/20 text-accent px-4 py-0.5 slanted-container text-[10px] font-headline uppercase tracking-[0.2em] shadow-lg border border-accent/30 mb-2">
        {mood}
      </div>
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />
        <div className="relative w-full h-full rounded-full border-2 border-primary/50 overflow-hidden bg-black/40 shadow-inner">
          <Image
            src={image.imageUrl}
            alt={`Manager is ${mood}`}
            width={400}
            height={400}
            className="object-cover"
            data-ai-hint={image.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40" />
        </div>
      </div>
    </div>
  );
};
