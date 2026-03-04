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

    // Tactical 4-4-2 Formations
    const userFormation = [
      [0.08, 0.5], // GK
      [0.2, 0.2], [0.2, 0.4], [0.2, 0.6], [0.2, 0.8], // DEF
      [0.35, 0.15], [0.35, 0.38], [0.35, 0.62], [0.35, 0.85], // MID
      [0.48, 0.4], [0.48, 0.6] // FWD
    ];

    const oppFormation = [
      [0.92, 0.5], // GK
      [0.8, 0.2], [0.8, 0.4], [0.8, 0.6], [0.8, 0.8], // DEF
      [0.65, 0.15], [0.65, 0.38], [0.65, 0.62], [0.65, 0.85], // MID
      [0.52, 0.4], [0.52, 0.6] // FWD
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
      possessorIndex: -1,
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

      // Ball Physics & Possession AI
      if (ball.possessorIndex !== -1) {
        const p = players[ball.possessorIndex];
        ball.x = p.x + (p.team === 'user' ? 4 : -4);
        ball.y = p.y;
        
        // Attacking behavior: Move towards opponent goal
        const attackTargetX = p.team === 'user' ? width - 15 : 15;
        const adx = attackTargetX - p.x;
        const ady = (height / 2) - p.y;
        const adist = Math.sqrt(adx * adx + ady * ady);
        
        // Dribbling speed
        p.vx = (adx / adist) * 1.8;
        p.vy = (ady / adist) * 1.8 + (Math.random() - 0.5) * 0.5;

        // Passing Logic: Random chance to switch possessor to a teammate in front
        if (Math.random() < 0.04) {
          ball.possessorIndex = -1;
          const teammates = players.filter((pl, idx) => pl.team === p.team && idx !== ball.possessorIndex);
          const forwardTeammates = teammates.filter(t => p.team === 'user' ? t.x > p.x : t.x < p.x);
          const target = (forwardTeammates.length > 0 ? forwardTeammates : teammates)[Math.floor(Math.random() * (forwardTeammates.length || teammates.length))];
          
          const pdx = target.x - p.x;
          const pdy = target.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          ball.vx = (pdx / pdist) * 5;
          ball.vy = (pdy / pdist) * 5;
        }
      } else {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98;
        ball.vy *= 0.98;

        if (ball.x < 10 || ball.x > width - 10) ball.vx *= -1;
        if (ball.y < 10 || ball.y > height - 10) ball.vy *= -1;

        // Acquisition: Nearest player grabs it
        players.forEach((p, idx) => {
          const dx = ball.x - p.x;
          const dy = ball.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 6) ball.possessorIndex = idx;
        });
      }

      // Realistic Formation Movement
      players.forEach((p, idx) => {
        if (ball.possessorIndex !== idx) {
          const dxBall = ball.x - p.x;
          const dyBall = ball.y - p.y;
          const distToBall = Math.sqrt(dxBall * dxBall + dyBall * dyBall);

          let tx = p.baseX;
          let ty = p.baseY;

          // Tactical Zone: Players chase ball if it enters their immediate area
          if (distToBall < 60) {
            tx = ball.x;
            ty = ball.y;
          }

          const dtx = tx - p.x;
          const dty = ty - p.y;
          const dDist = Math.sqrt(dtx * dtx + dty * dty);
          
          if (dDist > 1) {
            p.vx = (dtx / dDist) * 1.4;
            p.vy = (dty / dDist) * 1.4;
          } else {
            p.vx *= 0.1; p.vy *= 0.1;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Render Player Dot
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Render Yellow Soccer Ball (High visibility)
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
    <div className="flex flex-col items-center gap-4 w-full px-2 h-full justify-center">
      <div className="text-[10px] font-headline text-accent animate-pulse uppercase font-black tracking-[0.2em] italic">
        Match In Progress
      </div>
      
      <div className="relative premium-glass p-0.5 slanted-container w-full max-w-[280px] aspect-[4/3] border-white/10 overflow-hidden shadow-2xl bg-black/40">
        <canvas ref={canvasRef} width={280} height={210} className="w-full h-full rounded" />
        
        {showFinal && (
          <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 z-50 p-6">
            {isVARing ? (
              <div className="flex flex-col items-center gap-4 text-center">
                 <Search className="w-10 h-10 text-primary animate-bounce" />
                 <div className="text-[10px] font-headline uppercase tracking-[0.3em] text-primary font-black">VAR PANEL</div>
                 <div className="text-lg font-headline font-black text-white italic tracking-tighter">{varDecision}</div>
              </div>
            ) : (
              <>
                <div className="text-[10px] font-headline uppercase tracking-[0.4em] text-accent/60 mb-6 font-black">Full Time</div>
                
                <div className="flex items-center justify-between w-full gap-4 mb-8">
                  <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                    <div className="p-3 bg-destructive/10 rounded-full border border-destructive/20">
                      <Shield className="w-12 h-12 text-destructive" />
                    </div>
                    <div className="text-xl font-headline font-black uppercase text-center truncate w-full tracking-tight text-white">{userTeam}</div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="text-5xl font-headline font-black italic tracking-tighter flex items-center gap-4 text-white">
                      <span className={cn(result === 'win' ? "text-accent" : "text-white")}>{score.user}</span>
                      <span className="text-white/20">-</span>
                      <span className={cn(result === 'loss' ? "text-primary" : "text-white")}>{score.opp}</span>
                    </div>
                    <div className={cn(
                      "text-[10px] font-headline font-black uppercase px-3 py-1 tracking-widest rounded-full",
                      result === 'win' ? "bg-green-500/20 text-green-500" : result === 'draw' ? "bg-white/10 text-white/60" : "bg-destructive text-white"
                    )}>
                      {result === 'win' ? "WON" : result === 'draw' ? "DRAW" : "LOST"}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                    <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                      <Target className="w-12 h-12 text-primary" />
                    </div>
                    <div className="text-xl font-headline font-black uppercase text-center truncate w-full tracking-tight text-white">{opponentTeam}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  {result === 'loss' && (
                    <button 
                      onClick={handleVARRequest}
                      className="w-full py-3 premium-glass slanted-button text-[10px] font-black uppercase tracking-widest text-primary border-primary/40"
                    >
                      REQUEST VAR
                    </button>
                  )}
                  <SlantedButton onClick={onComplete} className="w-full py-4 text-sm font-black tracking-[0.3em] bg-white text-black">
                    PROCEED
                  </SlantedButton>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="text-center min-h-[40px] px-2 flex items-center justify-center">
        <p className="text-[11px] font-headline tracking-widest text-white/90 uppercase font-black italic animate-in fade-in duration-300">
          {getCommentary(timer)}
        </p>
      </div>
    </div>
  );
};
