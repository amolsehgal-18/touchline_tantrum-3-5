"use client"

import React, { useEffect, useRef, useState } from 'react';

export const MatchRadar = ({ onComplete }: { onComplete: (result: 'win' | 'draw' | 'loss') => void }) => {
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
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: i < 11 ? '#226BE0' : '#ffffff',
    }));

    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Pitch Lines
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
      ctx.stroke();

      // Update Players
      players.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update Ball
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x < 0 || ball.x > canvas.width) ball.vx *= -1;
      if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -1;
      
      ctx.fillStyle = '#FFAD1F';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
      ctx.fill();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          const outcomes: ('win' | 'draw' | 'loss')[] = ['win', 'draw', 'loss'];
          onComplete(outcomes[Math.floor(Math.random() * outcomes.length)]);
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
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-headline text-accent animate-pulse">MATCH SIMULATION IN PROGRESS</div>
      <div className="relative premium-glass p-2 slanted-container">
        <canvas ref={canvasRef} width={300} height={200} className="rounded" />
        <div className="absolute top-2 right-4 font-headline text-white/50">{timer}s</div>
      </div>
      <div className="text-[10px] font-headline tracking-widest opacity-50">RADIR™ ANALYTICS ENGINE ACTIVE</div>
    </div>
  );
};