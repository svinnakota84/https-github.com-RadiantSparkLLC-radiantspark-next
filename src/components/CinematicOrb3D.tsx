/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface CinematicOrb3DProps {
  variant?: 'global' | 'india' | 'usa' | 'sparkdeals' | 'brain' | 'lifestyle';
}

export const CinematicOrb3D: React.FC<CinematicOrb3DProps> = ({ variant = 'global' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Palette per territory
    const palettes = {
      global: {
        primary: [37, 99, 235],    // Blue
        secondary: [56, 189, 248],  // Cyan
        accent: [245, 158, 11],    // Amber
      },
      lifestyle: {
        primary: [16, 185, 129],   // Emerald
        secondary: [20, 184, 166], // Teal
        accent: [245, 158, 11],    // Amber
      },
      usa: {
        primary: [2, 132, 199],    // Sky blue
        secondary: [99, 102, 241], // Indigo
        accent: [56, 189, 248],    // Cyan
      },
      india: {
        primary: [217, 119, 6],    // Amber
        secondary: [234, 88, 12],  // Orange
        accent: [16, 185, 129],    // Emerald
      },
      sparkdeals: {
        primary: [239, 68, 68],    // Red
        secondary: [245, 158, 11], // Amber
        accent: [59, 130, 246],    // Blue
      },
      brain: {
        primary: [147, 51, 234],   // Purple
        secondary: [79, 70, 229],  // Indigo
        accent: [6, 182, 212],     // Cyan
      }
    };

    const currentPalette = palettes[variant] || palettes.global;

    // Star/particle field for 3D depth
    const starsCount = 45;
    const stars = Array.from({ length: starsCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.8 + 0.2, // Depth factor
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.0003 + 0.0001,
    }));

    // Mouse interactive coordinates
    let targetMouseX = 0.5;
    let targetMouseY = 0.35;
    let mouseX = 0.5;
    let mouseY = 0.35;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Proper resize handling with Device Pixel Ratio normalization
    // This fixes blurry rendering on Mac/Retina and uneven rendering across systems
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 to preserve GPU efficiency
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();

    let angle = 0;

    const render = () => {
      angle += 0.006;
      // Smooth lerp mouse interaction
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw 3D Depth Particle Field
      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) star.y = 1;

        // 3D Parallax offset based on depth (z)
        const px = (star.x + (mouseX - 0.5) * star.z * 0.1) * width;
        const py = (star.y + (mouseY - 0.5) * star.z * 0.1) * height;

        ctx.beginPath();
        ctx.arc(px, py, star.radius * star.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * star.z})`;
        ctx.fill();
      });

      // 2. Primary 3D Cinematic Volumetric Orb
      const orbCenterX = width * (0.68 + (mouseX - 0.5) * 0.08);
      const orbCenterY = Math.min(height * (0.35 + (mouseY - 0.5) * 0.08), 420);
      const baseRadius = Math.min(width * 0.28, 280);
      const dynamicRadius = baseRadius + Math.sin(angle * 1.5) * 8;

      // Outer ethereal atmospheric haze
      const hazeGrad = ctx.createRadialGradient(
        orbCenterX,
        orbCenterY,
        dynamicRadius * 0.2,
        orbCenterX,
        orbCenterY,
        dynamicRadius * 2.2
      );
      const [r1, g1, b1] = currentPalette.primary;
      const [r2, g2, b2] = currentPalette.secondary;
      const [r3, g3, b3] = currentPalette.accent;

      hazeGrad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0.38)`);
      hazeGrad.addColorStop(0.35, `rgba(${r2}, ${g2}, ${b2}, 0.20)`);
      hazeGrad.addColorStop(0.7, `rgba(${r3}, ${g3}, ${b3}, 0.08)`);
      hazeGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');

      ctx.fillStyle = hazeGrad;
      ctx.beginPath();
      ctx.arc(orbCenterX, orbCenterY, dynamicRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Core spherical volume with specular highlight
      const sphereGrad = ctx.createRadialGradient(
        orbCenterX - dynamicRadius * 0.35,
        orbCenterY - dynamicRadius * 0.35,
        dynamicRadius * 0.05,
        orbCenterX,
        orbCenterY,
        dynamicRadius
      );
      sphereGrad.addColorStop(0, `rgba(255, 255, 255, 0.65)`);
      sphereGrad.addColorStop(0.25, `rgba(${r2}, ${g2}, ${b2}, 0.45)`);
      sphereGrad.addColorStop(0.65, `rgba(${r1}, ${g1}, ${b1}, 0.28)`);
      sphereGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(orbCenterX, orbCenterY, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Secondary Radiant Orbital Node (Simulates orbital satellite / photon ring)
      const ringRadiusX = dynamicRadius * 1.35;
      const ringRadiusY = dynamicRadius * 0.45;
      const ringTilt = 0.45;

      ctx.save();
      ctx.translate(orbCenterX, orbCenterY);
      ctx.rotate(ringTilt);

      // Draw subtle orbital photon path
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r2}, ${g2}, ${b2}, 0.28)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Revolving energy spark on orbital path
      const sparkX = Math.cos(angle * 2) * ringRadiusX;
      const sparkY = Math.sin(angle * 2) * ringRadiusY;

      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, 1)`;
      ctx.shadowColor = `rgba(${r3}, ${g3}, ${b3}, 1)`;
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, [variant]);

  return (
    <div
      className="cinematic-atmosphere fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-95"
      aria-hidden="true"
    >
      <canvas
        id="cinematic-orb"
        ref={canvasRef}
        className="w-full h-full block"
      />
      {/* Subtle film grain texture overlay for cinematic polish */}
      <div
        className="ambient-noise absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};
