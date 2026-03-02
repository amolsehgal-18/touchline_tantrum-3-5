import React from 'react';
import { ManagerMood } from '@/lib/game-logic';
import Image from 'next/image';

const MOOD_IMAGES: Record<ManagerMood, string> = {
  happy: 'https://picsum.photos/seed/happy-manager/400/400',
  neutral: 'https://picsum.photos/seed/neutral-manager/400/400',
  stressed: 'https://picsum.photos/seed/stressed-manager/400/400',
  angry: 'https://picsum.photos/seed/angry-manager/400/400',
  sacked: 'https://picsum.photos/seed/sacked-manager/400/400',
};

export const ManagerMoodView = ({ mood }: { mood: ManagerMood }) => {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />
      <div className="relative w-full h-full rounded-full border-2 border-primary/50 overflow-hidden bg-black/40">
        <Image
          src={MOOD_IMAGES[mood]}
          alt={`Manager is ${mood}`}
          width={400}
          height={400}
          className="object-cover"
          data-ai-hint="football manager face"
        />
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-[10px] font-headline uppercase tracking-tighter">
        {mood}
      </div>
    </div>
  );
};