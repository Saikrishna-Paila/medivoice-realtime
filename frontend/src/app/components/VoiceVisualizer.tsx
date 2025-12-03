'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VoiceVisualizerProps {
  isActive: boolean;
  userSpeaking: boolean;
}

export function VoiceVisualizer({ isActive, userSpeaking }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>(Array(64).fill(0));
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const barCount = 64;
      const baseRadius = Math.min(width, height) * 0.25;
      const maxBarHeight = Math.min(width, height) * 0.18;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update phase for rotation
      phaseRef.current += userSpeaking ? 0.02 : 0.005;

      // Draw outer decorative ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + maxBarHeight + 15, 0, Math.PI * 2);
      ctx.strokeStyle = isActive ? 'rgba(6, 182, 212, 0.1)' : 'rgba(100, 116, 139, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw inner decorative ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius - 10, 0, Math.PI * 2);
      ctx.strokeStyle = isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(100, 116, 139, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update bar heights
      for (let i = 0; i < barCount; i++) {
        if (isActive && userSpeaking) {
          // Dynamic heights when speaking
          const wave1 = Math.sin(Date.now() / 80 + i * 0.4) * 0.3;
          const wave2 = Math.sin(Date.now() / 120 + i * 0.2) * 0.2;
          const random = Math.random() * 0.4;
          const targetHeight = 0.3 + random + wave1 + wave2;
          barsRef.current[i] = barsRef.current[i] * 0.7 + targetHeight * 0.3;
        } else if (isActive) {
          // Gentle breathing animation when listening
          const wave = Math.sin(Date.now() / 1000 + i * 0.1) * 0.15 + 0.2;
          barsRef.current[i] = barsRef.current[i] * 0.95 + wave * 0.05;
        } else {
          // Minimal flat when inactive
          const baseHeight = 0.08;
          barsRef.current[i] = barsRef.current[i] * 0.95 + baseHeight * 0.05;
        }
      }

      // Draw circular bars
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2 + phaseRef.current;
        const barHeight = Math.max(barsRef.current[i] * maxBarHeight, 3);

        const innerX = centerX + Math.cos(angle) * baseRadius;
        const innerY = centerY + Math.sin(angle) * baseRadius;
        const outerX = centerX + Math.cos(angle) * (baseRadius + barHeight);
        const outerY = centerY + Math.sin(angle) * (baseRadius + barHeight);

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(innerX, innerY, outerX, outerY);

        if (userSpeaking) {
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
          gradient.addColorStop(0.5, 'rgba(34, 211, 238, 1)');
          gradient.addColorStop(1, 'rgba(14, 165, 233, 0.8)');
        } else if (isActive) {
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0.6)');
        } else {
          gradient.addColorStop(0, 'rgba(71, 85, 105, 0.3)');
          gradient.addColorStop(1, 'rgba(100, 116, 139, 0.4)');
        }

        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Add glow effect for speaking bars
        if (userSpeaking && barsRef.current[i] > 0.5) {
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Draw center circle
      const centerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius - 15
      );

      if (userSpeaking) {
        centerGradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
        centerGradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.1)');
        centerGradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
      } else if (isActive) {
        centerGradient.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
        centerGradient.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
      } else {
        centerGradient.addColorStop(0, 'rgba(71, 85, 105, 0.1)');
        centerGradient.addColorStop(1, 'rgba(71, 85, 105, 0.02)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius - 15, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();

      // Draw center icon/status
      ctx.fillStyle = isActive ? (userSpeaking ? '#22d3ee' : '#06b6d4') : '#64748b';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (userSpeaking) {
        // Microphone waves icon representation
        ctx.fillText('SPEAKING', centerX, centerY);
      } else if (isActive) {
        ctx.fillText('LISTENING', centerX, centerY);
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillText('READY', centerX, centerY);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, userSpeaking]);

  return (
    <div className={cn(
      "relative w-full aspect-square max-w-[220px] mx-auto",
      "glass-card rounded-full p-3 transition-all duration-500",
      userSpeaking && "glow-cyan",
      isActive && !userSpeaking && "border-cyan-500/30"
    )}>
      {/* Animated rings when speaking */}
      {userSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 voice-ring" />
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 voice-ring" style={{ animationDelay: '0.5s' }} />
        </>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
