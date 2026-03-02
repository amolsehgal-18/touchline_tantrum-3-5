
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

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: 'user' | 'opp';
  color: string;
  baseX: number;
  baseY: number;
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
    if (t > 4) return "01': KICK OFF: Teams are in formation!";
    if (t > 3) return "24': Possession battle in the middle third.";
    if (t > 2) return "52': Tactical push! The defense is stretched.";
    if (t > 1) return "75': CHANCE! A thunderous strike at goal!";
    if (t > 0) return "89': DRAMATIC FINISH: Bodies on the line!";
    return "90'+3': FULL TIME: The whistle echoes!";
  };

  const handleVARRequest = () => {
    setIsVARing(true);
    setVarDecision("CHECKING VAR...");
    setTimeout(() => {
      setVarDecision("DECISION: NO GOAL");
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

    const width = canvas.width;
    const height = canvas.height;

    // 4-4-2 Formations
    const userFormation = [
      [0.05, 0.5], // GK
      [0.15, 0.2], [0.15, 0.4], [0.15, 0.6], [0.15, 0.8], // DEF
      [0.3, 0.15], [0.3, 0.38], [0.3, 0.62], [0.3, 0.85], // MID
      [0.45, 0.4], [0.45, 0.6] // FWD
    ];

    const oppFormation = [
      [0.95, 0.5], // GK
      [0.85, 0.2], [0.85, 0.4], [0.85, 0.6], [0.85, 0.8], // DEF
      [0.7, 0.15], [0.7, 0.38], [0.7, 0.62], [0.7, 0.85], // MID
      [0.55, 0.4], [0.55, 0.6] // FWD
    ];

    const players: Player[] = [
      ...userFormation.map(pos => ({
        x: pos[0] * width,
        y: pos[1] * height,
        vx: 0, vy: 0, team: 'user' as const, color: '#ef4444',
        baseX: pos[0] * width, baseY: pos[1] * height
      })),
      ...oppFormation.map(pos => ({
        x: pos[0] * width,
        y: pos[1] * height,
        vx: 0, vy: 0, team: 'opp' as const, color: '#226be0',
        baseX: pos[0] * width, baseY: pos[1] * height
      }))
    ];

    const ball = {
      x: width / 2,
      y: height / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      possessorIndex: -1
    };

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Pitch Render
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      
      // Markings
      ctx.strokeRect(5, 5, width - 10, height - 10);
      ctx.beginPath();
      ctx.moveTo(width / 2, 5);
      ctx.lineTo(width / 2, height - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 25, 0, Math.PI * 2);
      ctx.stroke();

      // Ball Physics
      if (ball.possessorIndex !== -1) {
        const p = players[ball.possessorIndex];
        ball.x = p.x + (p.team === 'user' ? 4 : -4);
        ball.y = p.y;
        
        // Move towards target goal
        const targetX = p.team === 'user' ? width - 10 : 10;
        const dx = targetX - p.x;
        const dy = (height / 2) - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        p.vx = (dx / dist) * 1.5;
        p.vy = (dy / dist) * 1.5 + (Math.random() - 0.5) * 0.4;

        // Pass or Shot
        if (Math.random() < 0.05) {
          ball.possessorIndex = -1;
          ball.vx = (p.team === 'user' ? 6 : -6) + (Math.random() - 0.5) * 2;
          ball.vy = (Math.random() - 0.5) * 4;
        }
      } else {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98;
        ball.vy *= 0.98;

        if (ball.x < 10 || ball.x > width - 10) ball.vx *= -1;
        if (ball.y < 10 || ball.y > height - 10) ball.vy *= -1;

        // Acquisition
        players.forEach((p, idx) => {
          const dx = ball.x - p.x;
          const dy = ball.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 6) ball.possessorIndex = idx;
        });
      }

      // Player Movement
      players.forEach((p, idx) => {
        if (ball.possessorIndex !== idx) {
          const dxBall = ball.x - p.x;
          const dyBall = ball.y - p.y;
          const distToBall = Math.sqrt(dxBall * dxBall + dyBall * dyBall);

          let tx = p.baseX;
          let ty = p.baseY;

          // Chase ball if close or if attacking/defending
          if (distToBall < 50) {
            tx = ball.x;
            ty = ball.y;
          }

          const dtx = tx - p.x;
          const dty = ty - p.y;
          const dDist = Math.sqrt(dtx * dtx + dty * dty);
          
          if (dDist > 1) {
            p.vx = (dtx / dDist) * 1.3;
            p.vy = (dty / dDist) * 1.3;
          } else {
            p.vx *= 0.2; p.vy *= 0.2;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Draw Dots
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Draw Ball
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => setShowFinal(true), 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 w-full px-2 h-full justify-center">
      <div className="text-[10px] font-headline text-accent animate-pulse uppercase font-black tracking-[0.2em] italic">
        LIVE MATCH ENGINE
      </div>
      
      <div className="relative premium-glass p-0.5 slanted-container w-full max-w-[260px] aspect-[4/3] border-white/10 overflow-hidden shadow-2xl bg-black/40">
        <canvas ref={canvasRef} width={260} height={195} className="w-full h-full rounded" />
        
        {showFinal && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 z-50 p-4">
            {isVARing ? (
              <div className="flex flex-col items-center gap-2 text-center">
                 <Search className="w-6 h-6 text-primary animate-bounce" />
                 <div className="text-[8px] font-headline uppercase tracking-[0.3em] text-primary font-black">VAR PANEL</div>
                 <div className="text-sm font-headline font-black text-white italic tracking-tighter">{varDecision}</div>
              </div>
            ) : (
              <>
                <div className="text-[8px] font-headline uppercase tracking-[0.3em] text-white/40 mb-2 font-black">Match Conclusion</div>
                
                <div className="flex items-center justify-between w-full gap-2 mb-4">
                  <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <Shield className="w-4 h-4 text-destructive" />
                    <div className="text-[8px] font-headline font-black uppercase text-center truncate w-full tracking-tight">{userTeam}</div>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="text-2xl font-headline font-black italic tracking-tighter flex items-center gap-2">
                      <span className={cn(result === 'win' ? "text-destructive" : "text-white")}>{score.user}</span>
                      <span className="text-white/20">-</span>
                      <span className={cn(result === 'loss' ? "text-primary" : "text-white")}>{score.opp}</span>
                    </div>
                    <div className={cn(
                      "text-[8px] font-headline font-black uppercase px-2 py-0.5 tracking-widest rounded",
                      result === 'win' ? "bg-destructive text-white" : result === 'draw' ? "bg-white/10 text-white/60" : "bg-primary text-white"
                    )}>
                      {result === 'win' ? "WON" : result === 'draw' ? "DRAW" : "LOST"}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <Target className="w-4 h-4 text-primary" />
                    <div className="text-[8px] font-headline font-black uppercase text-center truncate w-full tracking-tight">{opponentTeam}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-[150px]">
                  {result === 'loss' && (
                    <button 
                      onClick={handleVARRequest}
                      className="w-full py-2 premium-glass slanted-button text-[8px] font-black uppercase tracking-widest text-primary border-primary/40"
                    >
                      REQUEST VAR
                    </button>
                  )}
                  <SlantedButton onClick={onComplete} className="w-full py-2.5 text-[10px] font-black tracking-[0.2em] bg-white text-black">
                    PROCEED
                  </SlantedButton>
                </div>
              </>
            )}
          </div>
        )}

        {!showFinal && (
          <div className="absolute top-2 right-3 font-headline text-white/40 text-[8px] font-black uppercase tracking-[0.1em]">
            {timer}S
          </div>
        )}
      </div>
      
      <div className="text-center min-h-[30px] px-2 flex items-center justify-center">
        <p className="text-[10px] font-headline tracking-widest text-white/80 uppercase font-black italic animate-in fade-in duration-300">
          {getCommentary(timer)}
        </p>
      </div>
    </div>
  );
};
