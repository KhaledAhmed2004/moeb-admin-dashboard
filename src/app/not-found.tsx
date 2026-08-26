/* eslint-disable react-hooks/unsupported-syntax */
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle animation
    const particles: Particle[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * (canvas as HTMLCanvasElement).width;
        this.y = Math.random() * (canvas as HTMLCanvasElement).height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > (canvas as HTMLCanvasElement).width)
          this.vx *= -1;
        if (this.y < 0 || this.y > (canvas as HTMLCanvasElement).height)
          this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(148, 163, 184, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(148, 163, 184, .05) 25%, rgba(148, 163, 184, .05) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, .05) 75%, rgba(148, 163, 184, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(148, 163, 184, .05) 25%, rgba(148, 163, 184, .05) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, .05) 75%, rgba(148, 163, 184, .05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6">
        {/* Animated 404 */}
        <div className="mb-8 sm:mb-12">
          <div className="text-[120px] sm:text-[180px] md:text-[220px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 leading-none">
            404
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-50 mb-3 sm:mb-4 text-balance">
            Page Not Found
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed text-balance">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            href="/"
            className="px-6 sm:px-8 py-3 sm:py-3.5 bg-slate-50 text-slate-950 font-semibold rounded-lg hover:bg-slate-100 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-slate-400/20 active:scale-95 whitespace-nowrap"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 sm:px-8 py-3 sm:py-3.5 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-slate-900/30 active:scale-95 whitespace-nowrap"
          >
            Go Back
          </button>
        </div>

        {/* Subtle accent line */}
        <div className="mt-12 sm:mt-16 w-12 h-0.5 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
      </div>

      {/* Animated background elements */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 opacity-20 blur-3xl pointer-events-none animate-pulse" />
      <div
        className="absolute bottom-32 left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 opacity-15 blur-3xl pointer-events-none animate-pulse"
        style={{ animationDelay: "1s" }}
      />
    </main>
  );
}
