
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showFinal) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Tactical 4-4-2 Formations (Anchors for stability)
    const userFormation = [
      [0.10, 0.5], // GK
      [0.25, 0.25], [0.25, 0.42], [0.25, 0.58], [0.25, 0.75], // DEF
      [0.45, 0.2], [0.45, 0.4], [0.45, 0.6], [0.45, 0.8], // MID
      [0.60, 0.35], [0.60, 0.65] // FWD
    ];

    const oppFormation = [
      [0.90, 0.5], // GK
      [0.75, 0.25], [0.75, 0.42], [0.75, 0.58], [0.75, 0.75], // DEF
      [0.55, 0.2], [0.55, 0.4], [0.55, 0.6], [0.55, 0.8], // MID
      [0.40, 0.35], [0.40, 0.65] // FWD
    ];

    const players: Player[] = [
      ...userFormation.map(pos => ({
        x: pos[0] * width,
        y: pos[1] * height,
        vx: 0, vy: 0, team: 'user' as const, color: 'hsl(var(--primary))', // Blue
        baseX: pos[0] * width, baseY: pos[1] * height
      })),
      ...oppFormation.map(pos => ({
        x: pos[0] * width,
        y: pos[1] * height,
        vx: 0, vy: 0, team: 'opp' as const, color: '#ef4444', // Red
        baseX: pos[0] * width, baseY: pos[1] * height
      }))
    ];

    const ball = {
      x: width / 2,
      y: height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      possessorIndex: -1,
    };

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Pitch Grid Backdrop
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 5, width - 10, height - 10);
      ctx.beginPath();
      ctx.moveTo(width/2, 5);
      ctx.lineTo(width/2, height-5);
      ctx.stroke();

      // Ball Physics & Possession Logic
      if (ball.possessorIndex !== -1) {
        const p = players[ball.possessorIndex];
        ball.x = p.x;
        ball.y = p.y;
        
        // Dribbling towards target goal
        const targetX = p.team === 'user' ? width * 0.95 : width * 0.05;
        const targetY = height / 2;
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
          p.vx = (dx / dist) * 4;
          p.vy = (dy / dist) * 1.5;
        }

        // Passing Logic (8% chance to pass)
        if (Math.random() < 0.08) {
          const teammates = players.filter((pl, idx) => pl.team === p.team && idx !== ball.possessorIndex);
          const target = teammates[Math.floor(Math.random() * teammates.length)];
          ball.possessorIndex = -1;
          const pdx = target.x - p.x;
          const pdy = target.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          ball.vx = (pdx / pdist) * 20; // High speed pass
          ball.vy = (pdy / pdist) * 20;
        }
      } else {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98;
        ball.vy *= 0.98;

        if (ball.x < 10 || ball.x > width - 10) ball.vx *= -1;
        if (ball.y < 10 || ball.y > height - 10) ball.vy *= -1;

        // Intersection Logic
        players.forEach((p, idx) => {
          const dx = ball.x - p.x;
          const dy = ball.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 8) {
             ball.possessorIndex = idx;
             ball.vx = 0;
             ball.vy = 0;
          }
        });
      }

      // Player Movement (Formation + Reaction)
      players.forEach((p, idx) => {
        if (ball.possessorIndex !== idx) {
          const dBallX = ball.x - p.x;
          const dBallY = ball.y - p.y;
          const distToBall = Math.sqrt(dBallX * dBallX + dBallY * dBallY);

          // React faster if ball is close, else stay near base
          if (distToBall < 50) {
            p.vx = (dBallX / distToBall) * 3;
            p.vy = (dBallY / distToBall) * 3;
          } else {
            const dtx = p.baseX - p.x;
            const dty = p.baseY - p.y;
            const distToBase = Math.sqrt(dtx * dtx + dty * dty);
            if (distToBase > 2) {
              p.vx = (dtx / distToBase) * 2.5;
              p.vy = (dty / distToBase) * 2.5;
            } else {
              p.vx *= 0.3; p.vy *= 0.3;
            }
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Render Player
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Render Yellow Ball (Elite Visibility)
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [showFinal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFinal(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showFinal) {
    return (
      <div className="relative premium-glass p-5 slanted-container w-full max-w-[280px] border-white/10 shadow-2xl bg-black/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between w-full gap-2 mb-4">
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <Shield className="w-6 h-6 text-primary" />
            <div className="text-[11px] font-headline font-black uppercase text-center truncate w-full tracking-tight text-white">{userTeam}</div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="text-3xl font-headline font-black italic tracking-tighter flex items-center gap-2 mb-1">
              <span className={cn(result === 'win' ? "text-accent" : "text-white")}>{score.user}</span>
              <span className="text-white/20">-</span>
              <span className={cn(result === 'loss' ? "text-primary" : "text-white")}>{score.opp}</span>
            </div>
            <div className={cn(
              "text-[8px] font-headline font-black uppercase px-2.5 py-0.5 tracking-widest rounded-full",
              result === 'win' ? "bg-green-600/80 text-white" : result === 'draw' ? "bg-white/10 text-white/60" : "bg-red-600/80 text-white"
            )}>
              {result === 'win' ? "WON" : result === 'draw' ? "DRAW" : "LOST"}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <Target className="w-6 h-6 text-[#ef4444]" />
            <div className="text-[11px] font-headline font-black uppercase text-center truncate w-full tracking-tight text-white">{opponentTeam}</div>
          </div>
        </div>

        <SlantedButton onClick={onComplete} className="w-full py-2 text-[10px] font-black tracking-[0.3em] bg-white text-black">
          CONTINUE
        </SlantedButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
      <div className="text-[10px] font-headline text-accent animate-pulse uppercase font-black tracking-[0.2em] italic">
        Match In Progress
      </div>
      <div className="relative premium-glass p-0.5 slanted-container w-full max-w-[300px] aspect-[4/3] border-white/10 overflow-hidden bg-black/40">
        <canvas ref={canvasRef} width={300} height={225} className="w-full h-full rounded" />
      </div>
    </div>
  );
};
