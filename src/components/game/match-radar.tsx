
"use client"

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Target, Timer } from 'lucide-react';
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

const COMMENTARY_SNIPPETS = [
  { time: 0, text: "Kick off! The atmosphere is electric." },
  { time: 15, text: "A fierce battle in the middle of the park." },
  { time: 30, text: "Searching for a gap in the defense..." },
  { time: 45, text: "Half-time instructions being shouted." },
  { time: 60, text: "The tempo is picking up now." },
  { time: 75, text: "Tension mounting as the clock ticks down." },
  { time: 87, text: "87' Squeaky bum time!" },
  { time: 90, text: "Final whistle is imminent!" }
];

export const MatchRadar = ({ userTeam, opponentTeam, result, onComplete }: MatchRadarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFinal, setShowFinal] = useState(false);
  const [matchTime, setMatchTime] = useState(0);
  const [commentary, setCommentary] = useState(COMMENTARY_SNIPPETS[0].text);

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

    // Fluid 4-4-2 Scattered Formations
    const userFormation = [
      [0.08, 0.5], // GK
      [0.22, 0.25], [0.22, 0.42], [0.22, 0.58], [0.22, 0.75], // DEF
      [0.42, 0.2], [0.42, 0.4], [0.42, 0.6], [0.42, 0.8], // MID
      [0.65, 0.35], [0.65, 0.65] // FWD
    ];

    const oppFormation = [
      [0.92, 0.5], // GK
      [0.78, 0.25], [0.78, 0.42], [0.78, 0.58], [0.78, 0.75], // DEF
      [0.58, 0.2], [0.58, 0.4], [0.58, 0.6], [0.58, 0.8], // MID
      [0.35, 0.35], [0.35, 0.65] // FWD
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
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      possessorIndex: -1,
    };

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Pitch Grid
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 5, width - 10, height - 10);
      ctx.beginPath();
      ctx.moveTo(width/2, 5);
      ctx.lineTo(width/2, height-5);
      ctx.stroke();

      // Ball Logic
      if (ball.possessorIndex !== -1) {
        const p = players[ball.possessorIndex];
        ball.x = p.x;
        ball.y = p.y;
        
        // Passing AI: 12% chance per frame to pass
        if (Math.random() < 0.12) {
          const teammates = players.filter((pl, idx) => pl.team === p.team && idx !== ball.possessorIndex);
          const target = teammates[Math.floor(Math.random() * teammates.length)];
          ball.possessorIndex = -1;
          const pdx = target.x - p.x;
          const pdy = target.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          ball.vx = (pdx / pdist) * 12; 
          ball.vy = (pdy / pdist) * 12;
        }
      } else {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.99;
        ball.vy *= 0.99;

        if (ball.x < 10 || ball.x > width - 10) ball.vx *= -1;
        if (ball.y < 10 || ball.y > height - 10) ball.vy *= -1;

        // Intersection
        players.forEach((p, idx) => {
          const dx = ball.x - p.x;
          const dy = ball.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 6) {
             ball.possessorIndex = idx;
             ball.vx = 0;
             ball.vy = 0;
          }
        });
      }

      // Fluid Player Reaction
      players.forEach((p, idx) => {
        const dBallX = ball.x - p.x;
        const dBallY = ball.y - p.y;
        const distToBall = Math.sqrt(dBallX * dBallX + dBallY * dBallY);

        if (distToBall < 40) {
          p.vx = (dBallX / distToBall) * 2.5;
          p.vy = (dBallY / distToBall) * 2.5;
        } else {
          const dtx = p.baseX - p.x;
          const dty = p.baseY - p.y;
          const distToBase = Math.sqrt(dtx * dtx + dty * dty);
          if (distToBase > 2) {
            p.vx = (dtx / distToBase) * 1.5;
            p.vy = (dty / distToBase) * 1.5;
          } else {
            p.vx *= 0.5; p.vy *= 0.5;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Render Player
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.stroke();
      });

      // Render Yellow Soccer Ball
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

  // Match Clock & Commentary Timer
  useEffect(() => {
    if (showFinal) return;

    const totalDuration = 5000;
    const start = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / totalDuration, 1);
      const currentTime = Math.floor(progress * 90);
      setMatchTime(currentTime);

      const snippet = [...COMMENTARY_SNIPPETS].reverse().find(s => currentTime >= s.time);
      if (snippet) setCommentary(snippet.text);

      if (progress >= 1) {
        clearInterval(timer);
        setShowFinal(true);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [showFinal]);

  if (showFinal) {
    return (
      <div className="relative premium-glass p-5 slanted-container w-full max-w-[280px] border-white/10 shadow-2xl bg-black/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="text-[9px] font-headline font-black uppercase text-accent mb-4 tracking-[0.2em] italic">Full Time Result</div>
        
        <div className="flex items-center justify-between w-full gap-2 mb-6">
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

        <SlantedButton onClick={onComplete} className="w-full py-2.5 text-[9px] font-black tracking-[0.2em] bg-white text-black">
          PROCEED TO NEXT MATCH
        </SlantedButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full h-full justify-center px-4">
      <div className="w-full max-w-[300px] flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <Timer className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span className="text-xl font-headline font-black italic text-white">{matchTime}'</span>
        </div>
        <div className="text-[9px] font-headline text-accent/80 uppercase font-black tracking-widest italic animate-pulse">
          Matchday Live
        </div>
      </div>
      
      <div className="relative premium-glass p-0.5 slanted-container w-full max-w-[300px] aspect-[4/3] border-white/10 overflow-hidden bg-black/40 shadow-inner">
        <canvas ref={canvasRef} width={300} height={225} className="w-full h-full rounded" />
      </div>

      <div className="w-full max-w-[300px] bg-white/5 border border-white/5 p-3 rounded-md text-center">
        <p className="text-[10px] font-headline font-bold text-white/90 italic uppercase tracking-tight">
          "{commentary}"
        </p>
      </div>
    </div>
  );
};
