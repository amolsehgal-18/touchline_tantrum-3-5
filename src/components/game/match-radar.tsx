
"use client"

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Target } from 'lucide-react';
import { SlantedButton } from './slanted-elements';

interface MatchRadarProps {
  userTeam: string;
  opponentTeam: string;
  result: 'win' | 'draw' | 'loss' | null;
  onComplete: () => void;
}

export const MatchRadar = ({ userTeam, opponentTeam, result, onComplete }: MatchRadarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timer, setTimer] = useState(5);
  const [showFinal, setShowFinal] = useState(false);

  const score = useMemo(() => {
    if (result === 'win') {
      const g1 = Math.floor(Math.random() * 3) + 1;
      const g2 = Math.floor(Math.random() * g1);
      return { user: g1, opp: g2 };
    } else if (result === 'draw') {
      const g = Math.floor(Math.random() * 3);
      return { user: g, opp: g };
    } else {
      const g2 = Math.floor(Math.random() * 3) + 1;
      const g1 = Math.floor(Math.random() * g2);
      return { user: g1, opp: g2 };
    }
  }, [result]);

  const getCommentary = (t: number) => {
    if (t > 4) return "KICK OFF: The teams are out. A huge atmosphere here today...";
    if (t > 3) return "15': Tactical pressing from " + userTeam + ". Testing the backline...";
    if (t > 2) return "HT: Tactical regrouping in the dugout. Scores level...";
    if (t > 1) return "75': Tensions boiling over! The referee manages the conflict...";
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
      // User = Red (#ef4444), Opponent = Blue (#226be0)
      color: i < 11 ? '#ef4444' : '#226be0',
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

      // Players
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

      // Ball = Yellow (#ffff00)
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x < 10 || ball.x > canvas.width - 10) ball.vx *= -1;
      if (ball.y < 10 || ball.y > canvas.height - 10) ball.vy *= -1;
      ctx.fillStyle = '#ffff00';
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

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4 py-4 h-full justify-center">
      <div className="text-xl font-headline text-accent animate-pulse uppercase font-black tracking-tighter">
        MATCH SIMULATION
      </div>
      
      <div className="relative premium-glass p-1 slanted-container w-full max-w-[320px] aspect-[3/2] border-white/10 overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={300} height={200} className="w-full h-full rounded bg-black/40" />
        
        {showFinal && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 z-50 p-6">
            <div className="text-[10px] font-headline uppercase tracking-[0.4em] text-white/40 mb-6">Full Time Result</div>
            
            <div className="flex items-center justify-between w-full gap-2 mb-8">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded bg-destructive/20 border border-destructive/50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <Shield className="w-7 h-7 text-destructive" />
                </div>
                <div className="text-[11px] font-headline font-black uppercase text-center truncate w-full mt-1">{userTeam}</div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="text-5xl font-headline font-black italic tracking-tighter flex items-center gap-3">
                  <span className={cn(result === 'win' ? "text-destructive" : "text-white")}>{score.user}</span>
                  <span className="text-white/20">-</span>
                  <span className={cn(result === 'loss' ? "text-primary" : "text-white")}>{score.opp}</span>
                </div>
                <div className={cn(
                  "text-[10px] font-headline font-black uppercase px-3 py-1 slanted-container",
                  result === 'win' ? "bg-destructive text-white" : result === 'draw' ? "bg-white/10 text-white/60" : "bg-primary text-white"
                )}>
                  {result === 'win' ? "VICTORY" : result === 'draw' ? "DRAW" : "DEFEAT"}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <div className="text-[11px] font-headline font-black uppercase text-center truncate w-full mt-1">{opponentTeam}</div>
              </div>
            </div>

            <SlantedButton onClick={onComplete} className="w-full py-4 text-xs font-black tracking-widest bg-white text-black hover:bg-white/90">
              PROCEED TO NEXT WEEK
            </SlantedButton>
          </div>
        )}

        {!showFinal && (
          <div className="absolute top-2 right-4 font-headline text-white/50 text-[10px] font-black uppercase tracking-widest">
            {timer}S
          </div>
        )}
      </div>
      
      <div className="text-center min-h-[40px] px-6 mt-4">
        <p className="text-[11px] font-headline tracking-widest text-white/80 uppercase font-black italic animate-in fade-in slide-in-from-bottom-2 duration-700">
          {getCommentary(timer)}
        </p>
      </div>
    </div>
  );
};
