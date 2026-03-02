"use client"

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Target, Search } from 'lucide-react';
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
  const [isVARing, setIsVARing] = useState(false);
  const [varDecision, setVarDecision] = useState<string | null>(null);

  const score = useMemo(() => {
    if (result === 'win') {
      const g1 = Math.floor(Math.random() * 2) + 1;
      const g2 = Math.floor(Math.random() * g1);
      return { user: g1, opp: g2 };
    } else if (result === 'draw') {
      const g = Math.floor(Math.random() * 2);
      return { user: g, opp: g };
    } else {
      const g2 = Math.floor(Math.random() * 2) + 1;
      const g1 = Math.floor(Math.random() * g2);
      return { user: g1, opp: g2 };
    }
  }, [result]);

  const getCommentary = (t: number) => {
    if (t > 4) return "08': KICK OFF: Midfield battle heating up!";
    if (t > 3) return "32': Charging into the final third!";
    if (t > 2) return "55': GOAL-MOUTH DRAMA! Bodies on the line!";
    if (t > 1) return "78': The keeper is beaten! It's pure chaos!";
    if (t > 0) return "89': SCREAMER FROM DISTANCE! Tension absolute!";
    return "90'+3': FULL TIME: The final whistle blows!";
  };

  const handleVARRequest = () => {
    setIsVARing(true);
    setVarDecision("CHECKING VAR...");
    setTimeout(() => {
      setVarDecision("DECISION: GOAL STANDS");
      setTimeout(() => {
        setIsVARing(false);
        setVarDecision(null);
      }, 1500);
    }, 2000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const players = Array.from({ length: 22 }, (_, i) => ({
      x: i < 11 ? 50 + Math.random() * 100 : canvas.width - 150 + Math.random() * 100,
      y: Math.random() * canvas.height,
      vx: 0,
      vy: 0,
      team: i < 11 ? 'user' : 'opp',
      color: i < 11 ? '#ef4444' : '#226be0',
      baseX: i < 11 ? 50 + Math.random() * 100 : canvas.width - 150 + Math.random() * 100,
      baseY: Math.random() * canvas.height,
    }));

    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      possessorIndex: -1,
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 10);
      ctx.lineTo(canvas.width / 2, canvas.height - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
      ctx.stroke();

      if (ball.possessorIndex !== -1) {
        const p = players[ball.possessorIndex];
        const dribbleAngle = Date.now() / 80;
        ball.x = p.x + Math.cos(dribbleAngle) * 5;
        ball.y = p.y + Math.sin(dribbleAngle) * 5;
        
        const targetGoalX = p.team === 'user' ? canvas.width - 15 : 15;
        const dx = targetGoalX - p.x;
        const dy = (canvas.height / 2) - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        p.vx = (dx / dist) * 3.5;
        p.vy = (dy / dist) * 3.5;

        if (Math.random() < 0.15) {
          ball.possessorIndex = -1;
          ball.vx = (p.team === 'user' ? 12 : -12) + (Math.random() - 0.5) * 6;
          ball.vy = (Math.random() - 0.5) * 14;
        }
      } else {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.99;
        ball.vy *= 0.99;

        if (ball.x < 10 || ball.x > canvas.width - 10) ball.vx *= -1;
        if (ball.y < 10 || ball.y > canvas.height - 10) ball.vy *= -1;

        players.forEach((p, idx) => {
          const dx = ball.x - p.x;
          const dy = ball.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 12) {
            ball.possessorIndex = idx;
          }
        });
      }

      players.forEach((p, idx) => {
        if (ball.possessorIndex !== idx) {
          const chaseDist = 120;
          const dxBall = ball.x - p.x;
          const dyBall = ball.y - p.y;
          const distToBall = Math.sqrt(dxBall * dxBall + dyBall * dyBall);

          let targetX = p.baseX;
          let targetY = p.baseY;

          if (distToBall < chaseDist) {
            targetX = ball.x;
            targetY = ball.y;
          }
          
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 1.5) {
            p.vx = (dx / dist) * 3;
            p.vy = (dy / dist) * 3;
          } else {
            p.vx *= 0.8;
            p.vy *= 0.8;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();

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
    <div className="flex flex-col items-center gap-4 w-full px-2 py-2 h-full justify-center">
      <div className="text-xl font-headline text-accent animate-pulse uppercase font-black tracking-tighter italic">
        LIVE MATCH
      </div>
      
      <div className="relative premium-glass p-1 slanted-container w-full max-w-[320px] aspect-[4/3] border-white/20 overflow-hidden shadow-xl">
        <canvas ref={canvasRef} width={300} height={225} className="w-full h-full rounded bg-black/40" />
        
        {showFinal && (
          <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 z-50 p-4">
            {isVARing ? (
              <div className="flex flex-col items-center gap-4 text-center">
                 <Search className="w-12 h-12 text-primary animate-bounce" />
                 <div className="text-[10px] font-headline uppercase tracking-[0.4em] text-primary font-black">VAR CHECK</div>
                 <div className="text-xl font-headline font-black text-white italic tracking-tighter">{varDecision}</div>
              </div>
            ) : (
              <>
                <div className="text-[10px] font-headline uppercase tracking-[0.4em] text-white/40 mb-4 font-black">Full Time Result</div>
                
                <div className="flex items-center justify-between w-full gap-2 mb-6">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 h-10 rounded bg-destructive/20 border border-destructive/50 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="text-[9px] font-headline font-black uppercase text-center truncate w-full tracking-tight">{userTeam}</div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="text-4xl font-headline font-black italic tracking-tighter flex items-center gap-2">
                      <span className={cn(result === 'win' ? "text-destructive" : "text-white")}>{score.user}</span>
                      <span className="text-white/20">-</span>
                      <span className={cn(result === 'loss' ? "text-primary" : "text-white")}>{score.opp}</span>
                    </div>
                    <div className={cn(
                      "text-[9px] font-headline font-black uppercase px-2 py-0.5 tracking-widest",
                      result === 'win' ? "bg-destructive text-white" : result === 'draw' ? "bg-white/10 text-white/60" : "bg-primary text-white"
                    )}>
                      {result === 'win' ? "WON" : result === 'draw' ? "DRAW" : "LOST"}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 h-10 rounded bg-primary/20 border border-primary/50 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-[9px] font-headline font-black uppercase text-center truncate w-full tracking-tight">{opponentTeam}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  {result === 'loss' && (
                    <button 
                      onClick={handleVARRequest}
                      className="w-full py-2 premium-glass slanted-button text-[9px] font-black uppercase tracking-widest text-primary border-primary/40"
                    >
                      REQUEST VAR
                    </button>
                  )}
                  <SlantedButton onClick={onComplete} className="w-full py-3 text-[11px] font-black tracking-[0.2em] bg-white text-black">
                    PROCEED
                  </SlantedButton>
                </div>
              </>
            )}
          </div>
        )}

        {!showFinal && (
          <div className="absolute top-2 right-4 font-headline text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
            {timer}S
          </div>
        )}
      </div>
      
      <div className="text-center min-h-[40px] px-4">
        <p className="text-[11px] font-headline tracking-widest text-white/80 uppercase font-black italic animate-in fade-in duration-500">
          {getCommentary(timer)}
        </p>
      </div>
    </div>
  );
};