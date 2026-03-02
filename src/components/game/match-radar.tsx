"use client"

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MatchRadarProps {
  result: 'win' | 'draw' | 'loss' | null;
  onComplete: () => void;
}

export const MatchRadar = ({ result, onComplete }: MatchRadarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timer, setTimer] = useState(5);
  const [showFinal, setShowFinal] = useState(false);

  const getCommentary = (t: number) => {
    if (t > 3) return "Opening exchanges. High intensity pressing from the start...";
    if (t > 1) return "HT: Tactical regrouping in the dugout. Scores level...";
    if (t > 0) return "FINAL MINUTES! Every tackle counts as the tension rises...";
    return "FULL TIME: The final whistle goes!";
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const players = Array.from({ length: 22 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: i < 11 ? 'hsl(var(--primary))' : '#ffffff',
    }));

    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Pitch lines
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 5);
      ctx.lineTo(canvas.width / 2, canvas.height - 5);
      ctx.stroke();

      // Update Players
      players.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 10 || p.x > canvas.width - 10) p.vx *= -1;
        if (p.y < 10 || p.y > canvas.height - 10) p.vy *= -1;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update Ball
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x < 10 || ball.x > canvas.width - 10) ball.vx *= -1;
      if (ball.y < 10 || ball.y > canvas.height - 10) ball.vy *= -1;
      ctx.fillStyle = 'hsl(var(--accent))';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowFinal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (showFinal) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [showFinal, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4 py-8">
      <div className="text-xl font-headline text-accent animate-pulse uppercase font-black tracking-tighter">
        MATCH SIMULATION
      </div>
      
      <div className="relative premium-glass p-1 slanted-container w-full max-w-[320px] aspect-[3/2] border-white/10 overflow-hidden">
        <canvas ref={canvasRef} width={300} height={200} className="w-full h-full rounded bg-black/40" />
        
        {showFinal && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 z-50">
            <div className="text-[10px] font-headline uppercase tracking-[0.4em] text-white/40 mb-2">Full Time Result</div>
            <div className={cn(
              "text-5xl font-headline font-black uppercase italic tracking-tighter scale-110",
              result === 'win' ? "text-primary" : result === 'draw' ? "text-white/60" : "text-destructive"
            )}>
              {result === 'win' ? "VICTORY" : result === 'draw' ? "STALEMATE" : "DEFEAT"}
            </div>
            <div className="mt-6 flex gap-6 text-sm font-headline font-black uppercase opacity-90">
              <span className={result === 'win' ? "text-primary" : ""}>3 PTS</span>
              <span className="opacity-20">|</span>
              <span className={result === 'draw' ? "text-white" : ""}>1 PT</span>
              <span className="opacity-20">|</span>
              <span className={result === 'loss' ? "text-destructive" : ""}>0 PTS</span>
            </div>
          </div>
        )}

        <div className="absolute top-2 right-4 font-headline text-white/50 text-[10px] font-black uppercase tracking-widest">
          {timer}S
        </div>
      </div>
      
      <div className="text-center min-h-[40px] px-6">
        <p className="text-[11px] font-headline tracking-widest text-white/80 uppercase font-black italic animate-in fade-in slide-in-from-bottom-2 duration-700">
          {getCommentary(timer)}
        </p>
      </div>
    </div>
  );
};