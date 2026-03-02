"use client"

import React, { useEffect, useRef, useState } from 'react';

export const MatchRadar = ({ onComplete }: { onComplete: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timer, setTimer] = useState(5);

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
      
      // Pitch Background
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pitch Lines
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      
      // Boundary
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      // Half-way line
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 10);
      ctx.lineTo(canvas.width / 2, canvas.height - 10);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
      ctx.stroke();

      // Penalty Areas
      ctx.strokeRect(10, canvas.height / 2 - 40, 40, 80);
      ctx.strokeRect(canvas.width - 50, canvas.height / 2 - 40, 40, 80);

      // Update Players
      players.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Simple bounce with pitch constraints
        if (p.x < 15 || p.x > canvas.width - 15) p.vx *= -1;
        if (p.y < 15 || p.y > canvas.height - 15) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a small glow to team dots
        if (p.color !== '#ffffff') {
          ctx.shadowBlur = 5;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Update Ball (Faster, erratic)
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x < 12 || ball.x > canvas.width - 12) ball.vx *= -1;
      if (ball.y < 12 || ball.y > canvas.height - 12) ball.vy *= -1;
      
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
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4">
      <div className="text-xl font-headline text-accent animate-pulse uppercase tracking-tighter font-bold">MATCH SIMULATION</div>
      <div className="relative premium-glass p-1 slanted-container w-full max-w-[320px] aspect-[3/2] border-white/10">
        <canvas ref={canvasRef} width={300} height={200} className="w-full h-full rounded bg-black/40" />
        <div className="absolute top-2 right-4 font-headline text-white/50 text-[10px]">{timer}S REMAINING</div>
      </div>
      <div className="text-[10px] font-headline tracking-widest opacity-50 uppercase">RADIR™ Live Tactical Feed</div>
    </div>
  );
};