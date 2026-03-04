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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showFinal) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Tactical 4-4-2 Formations
    const userFormation = [
      [0.08, 0.5], // GK
      [0.2, 0.25], [0.2, 0.42], [0.2, 0.58], [0.2, 0.75], // DEF
      [0.35, 0.15], [0.35, 0.4], [0.35, 0.6], [0.35, 0.85], // MID
      [0.46, 0.4], [0.46, 0.6] // FWD
    ];

    const oppFormation = [
      [0.92, 0.5], // GK
      [0.8, 0.25], [0.8, 0.42], [0.8, 0.58], [0.8, 0.75], // DEF
      [0.65, 0.15], [0.65, 0.4], [0.65, 0.6], [0.65, 0.85], // MID
      [0.54, 0.4], [0.54, 0.6] // FWD
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
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      
      // Markings
      ctx.strokeRect(5, 5, width - 10, height - 10);
      ctx.beginPath();
      ctx.moveTo(width / 2, 5);
      ctx.lineTo(width / 2, height - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 20, 0, Math.PI * 2);
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
        
        // Controlled Dribbling
        p.vx = (adx / adist) * 1.5;
        p.vy = (ady / adist) * 1.2 + (Math.random() - 0.5) * 0.4;

        // Passing Logic: Random chance to switch possessor to a forward teammate
        if (Math.random() < 0.05) {
          ball.possessorIndex = -1;
          const teammates = players.filter((pl, idx) => pl.team === p.team && idx !== ball.possessorIndex);
          const forwardTeammates = teammates.filter(t => p.team === 'user' ? t.x > p.x : t.x < p.x);
          const target = (forwardTeammates.length > 0 ? forwardTeammates : teammates)[Math.floor(Math.random() * (forwardTeammates.length || teammates.length))];
          
          const pdx = target.x - p.x;
          const pdy = target.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          ball.vx = (pdx / pdist) * 6;
          ball.vy = (pdy / pdist) * 6;
        }
      } else {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.985;
        ball.vy *= 0.985;

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

      // Tactical Movement
      players.forEach((p, idx) => {
        if (ball.possessorIndex !== idx) {
          const dxBall = ball.x - p.x;
          const dyBall = ball.y - p.y;
          const distToBall = Math.sqrt(dxBall * dxBall + dyBall * dyBall);

          let tx = p.baseX;
          let ty = p.baseY;

          // React to ball if it's near
          if (distToBall < 50) {
            tx = ball.x;
            ty = ball.y;
          }

          const dtx = tx - p.x;
          const dty = ty - p.y;
          const dDist = Math.sqrt(dtx * dtx + dty * dty);
          
          if (dDist > 1) {
            p.vx = (dtx / dDist) * 1.2;
            p.vy = (dty / dDist) * 1.2;
          } else {
            p.vx *= 0.2; p.vy *= 0.2;
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

      // Render Soccer Ball (High-Visibility Yellow)
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [showFinal]);

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
        {showFinal ? "Full Time" : "Match In Progress"}
      </div>
      
      {showFinal ? (
        <div className="relative premium-glass p-6 slanted-container w-full max-w-[300px] border-white/10 overflow-hidden shadow-2xl bg-black/98 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="text-[9px] font-headline uppercase tracking-[0.4em] text-accent/60 mb-5 font-black">Full Time</div>
          
          <div className="flex items-center justify-between w-full gap-2 mb-8">
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div className="p-1.5 bg-destructive/10 rounded-full border border-destructive/20">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <div className="text-[11px] font-headline font-black uppercase text-center truncate w-full tracking-tight text-white">{userTeam}</div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl font-headline font-black italic tracking-tighter flex items-center gap-2 text-white">
                <span className={cn(result === 'win' ? "text-accent" : "text-white")}>{score.user}</span>
                <span className="text-white/20">-</span>
                <span className={cn(result === 'loss' ? "text-primary" : "text-white")}>{score.opp}</span>
              </div>
              <div className={cn(
                "text-[8px] font-headline font-black uppercase px-2 py-0.5 tracking-widest rounded-full",
                result === 'win' ? "bg-green-600/80 text-white" : result === 'draw' ? "bg-white/10 text-white/60" : "bg-red-600/80 text-white"
              )}>
                {result === 'win' ? "WON" : result === 'draw' ? "DRAW" : "LOST"}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div className="p-1.5 bg-primary/10 rounded-full border border-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="text-[11px] font-headline font-black uppercase text-center truncate w-full tracking-tight text-white">{opponentTeam}</div>
            </div>
          </div>

          <SlantedButton onClick={onComplete} className="w-full py-3 text-[10px] font-black tracking-[0.3em] bg-white text-black">
            PROCEED
          </SlantedButton>
        </div>
      ) : (
        <div className="relative premium-glass p-0.5 slanted-container w-full max-w-[280px] aspect-[4/3] border-white/10 overflow-hidden shadow-2xl bg-black/40">
          <canvas ref={canvasRef} width={280} height={210} className="w-full h-full rounded" />
        </div>
      )}
      
      <div className="text-center min-h-[40px] px-2 flex items-center justify-center">
        <p className="text-[11px] font-headline tracking-widest text-white/90 uppercase font-black italic animate-in fade-in duration-300">
          {getCommentary(timer)}
        </p>
      </div>
    </div>
  );
};