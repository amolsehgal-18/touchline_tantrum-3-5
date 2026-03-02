
import React from 'react';
import { ManagerMood } from '@/lib/game-logic';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const ManagerMoodView = ({ mood }: { mood: ManagerMood }) => {
  const image = PlaceHolderImages.find(img => img.id === `manager-${mood}`) || PlaceHolderImages[1];

  return (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />
      <div className="relative w-full h-full rounded-full border-2 border-primary/50 overflow-hidden bg-black/40">
        <Image
          src={image.imageUrl}
          alt={`Manager is ${mood}`}
          width={400}
          height={400}
          className="object-cover"
          data-ai-hint={image.imageHint}
        />
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-[10px] font-headline uppercase tracking-tighter shadow-lg">
        {mood}
      </div>
    </div>
  );
};
