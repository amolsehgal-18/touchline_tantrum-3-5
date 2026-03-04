
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showFinal) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Tactical 4-4-2 Formations (Anchored)
    const userFormation = [
      [0.08, 0.5], // GK
      [0.22, 0.25], [0.22, 0.42], [0.22, 0.58], [0.22, 0.75], // DEF
      [0.38, 0.15], [0.38, 0.4], [0.38, 0.6], [0.38, 0.85], // MID
      [0.46, 0.4], [0.46, 0.6] // FWD
    ];

    const oppFormation = [
      [0.92, 0.5], // GK
      [0.78, 0.25], [0.78, 0.42], [0.78, 0.58], [0.78, 0.75], // DEF
      [0.62, 0.15], [0.62, 0.4], [0.62, 0.6], [0.62, 0.85], // MID
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
      vx: (Math.random() - 0.5) * 12, // High initial speed
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

      // Ball Physics & Logic
      if (ball.possessorIndex !== -1) {
        const p = players[ball.possessorIndex];
        ball.x = p.x + (p.team === 'user' ? 4 : -4);
        ball.y = p.y;
        
        // Dribble Logic
        const targetX = p.team === 'user' ? width * 0.95 : width * 0.05;
        const dx = targetX - p.x;
        const dy = (height / 2) - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        p.vx = (dx / dist) * 2.5; 
        p.vy = (dy / dist) * 0.8;

        // Passing Logic (Randomly trigger a pass)
        if (Math.random() < 0.08) { 
          const teammates = players.filter((pl, idx) => pl.team === p.team && idx !== ball.possessorIndex);
          // Pick a teammate who is "ahead"
          const target = teammates[Math.floor(Math.random() * teammates.length)];
          ball.possessorIndex = -1;
          const pdx = target.x - p.x;
          const pdy = target.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          ball.vx = (pdx / pdist) * 14; // Fast pass
          ball.vy = (pdy / pdist) * 14;
        }
      } else {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98; // Friction
        ball.vy *= 0.98;

        if (ball.x < 10 || ball.x > width - 10) ball.vx *= -1;
        if (ball.y < 10 || ball.y > height - 10) ball.vy *= -1;

        // Interception Logic
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

      // Player Formation Logic
      players.forEach((p, idx) => {
        if (ball.possessorIndex !== idx) {
          const dxBall = ball.x - p.x;
          const dyBall = ball.y - p.y;
          const distToBall = Math.sqrt(dxBall * dxBall + dyBall * dyBall);

          let tx = p.baseX;
          let ty = p.baseY;

          // React to ball if close
          if (distToBall < 50) { 
            tx = p.baseX + (ball.x - p.baseX) * 0.4;
            ty = p.baseY + (ball.y - p.baseY) * 0.4;
          }

          const dtx = tx - p.x;
          const dty = ty - p.y;
          const dDist = Math.sqrt(dtx * dtx + dty * dty);
          
          if (dDist > 1) {
            p.vx = (dtx / dDist) * 2.2; 
            p.vy = (dty / dDist) * 2.2;
          } else {
            p.vx = 0;
            p.vy = 0;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Render Player
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Render Ball (High Visibility)
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
  }, [showFinal]);

  useEffect(() => {
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
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
      <div className="text-[10px] font-headline text-accent animate-pulse uppercase font-black tracking-[0.2em] italic">
        {showFinal ? "Full Time" : "Match In Progress"}
      </div>
      
      {showFinal ? (
        <div className="relative premium-glass p-6 slanted-container w-full max-w-[280px] border-white/10 shadow-2xl bg-black/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="text-[10px] font-headline font-black uppercase text-accent/60 mb-4 tracking-[0.3em]">Full Time</div>
          
          <div className="flex items-center justify-between w-full gap-2 mb-6">
            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <Shield className="w-6 h-6 text-destructive" />
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
              <Target className="w-6 h-6 text-primary" />
              <div className="text-[11px] font-headline font-black uppercase text-center truncate w-full tracking-tight text-white">{opponentTeam}</div>
            </div>
          </div>

          <SlantedButton onClick={onComplete} className="w-full py-2.5 text-[10px] font-black tracking-[0.3em] bg-white text-black">
            CONTINUE
          </SlantedButton>
        </div>
      ) : (
        <div className="relative premium-glass p-0.5 slanted-container w-full max-w-[300px] aspect-[4/3] border-white/10 overflow-hidden bg-black/40">
          <canvas ref={canvasRef} width={300} height={225} className="w-full h-full rounded" />
        </div>
      )}
    </div>
  );
};
