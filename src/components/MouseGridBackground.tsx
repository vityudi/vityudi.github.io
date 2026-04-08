"use client";
import { useEffect, useRef } from "react";

const GRID = 40;
const DOT_COUNT = 4;
const DOT_SPEED = 0.07;
const TRAIL_NODES = 3;

type DotState = {
  waypoints: { x: number; y: number }[]; // visited nodes, oldest first
  px: number; py: number;                // current segment start
  tx: number; ty: number;                // current segment end
  progress: number;
  dir: number;
  hue: number;
};

const DIRS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 },
];

function pickDir(dot: DotState, w: number, h: number): number {
  const opposite = (dot.dir + 2) % 4;
  const candidates = DIRS
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i !== opposite)
    .filter(({ d }) => {
      const nx = dot.tx + d.dx * GRID;
      const ny = dot.ty + d.dy * GRID;
      return nx >= 0 && nx <= w && ny >= 0 && ny <= h;
    });
  if (candidates.length === 0) return opposite;
  return candidates[Math.floor(Math.random() * candidates.length)].i;
}

export function MouseGridBackground() {
  const lightRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (lightRef.current) {
        lightRef.current.style.background = `radial-gradient(800px circle at ${e.clientX}px ${e.clientY}px, rgba(0, 240, 255, 0.12), transparent 40%)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const hues = [185, 195, 175, 205];
    const dots: DotState[] = Array.from({ length: DOT_COUNT }, (_, i) => {
      const cols = Math.floor(window.innerWidth / GRID);
      const rows = Math.floor(window.innerHeight / GRID);
      const gx = Math.floor(Math.random() * cols) * GRID;
      const gy = Math.floor(Math.random() * rows) * GRID;
      return {
        waypoints: [{ x: gx, y: gy }],
        px: gx, py: gy,
        tx: gx, ty: gy,
        progress: 1,
        dir: Math.floor(Math.random() * 4),
        hue: hues[i % hues.length],
      };
    });

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const dot of dots) {
        // Node reached — record waypoint, choose next direction
        if (dot.progress >= 1) {
          dot.waypoints.push({ x: dot.tx, y: dot.ty });
          if (dot.waypoints.length > TRAIL_NODES) dot.waypoints.shift();

          dot.progress = 0;
          dot.px = dot.tx;
          dot.py = dot.ty;

          if (Math.random() < 0.18) dot.dir = pickDir(dot, canvas.width, canvas.height);

          let nx = dot.tx + DIRS[dot.dir].dx * GRID;
          let ny = dot.ty + DIRS[dot.dir].dy * GRID;
          if (nx < 0 || nx > canvas.width || ny < 0 || ny > canvas.height) {
            dot.dir = pickDir(dot, canvas.width, canvas.height);
            nx = dot.tx + DIRS[dot.dir].dx * GRID;
            ny = dot.ty + DIRS[dot.dir].dy * GRID;
          }
          dot.tx = nx;
          dot.ty = ny;
        }

        dot.progress = Math.min(1, dot.progress + DOT_SPEED);
        const cx = dot.px + (dot.tx - dot.px) * dot.progress;
        const cy = dot.py + (dot.ty - dot.py) * dot.progress;

        // All points including in-progress head
        const pts = [...dot.waypoints, { x: cx, y: cy }];
        if (pts.length < 2) continue;

        // ── Trail with continuous fade ──
        // Subdivide each segment so alpha interpolates smoothly (no visible steps)
        const SUB = 5;
        const totalSubs = (pts.length - 1) * SUB;
        const layers = [
          { width: 8,   alpha: 0.06 },
          { width: 3.5, alpha: 0.14 },
          { width: 1,   alpha: 0.40 },
        ];

        for (const layer of layers) {
          for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            for (let s = 0; s < SUB; s++) {
              const ta = (i * SUB + s)     / totalSubs;
              const tb = (i * SUB + s + 1) / totalSubs;
              const xa = p0.x + (p1.x - p0.x) * (s / SUB);
              const ya = p0.y + (p1.y - p0.y) * (s / SUB);
              const xb = p0.x + (p1.x - p0.x) * ((s + 1) / SUB);
              const yb = p0.y + (p1.y - p0.y) * ((s + 1) / SUB);
              ctx.beginPath();
              ctx.moveTo(xa, ya);
              ctx.lineTo(xb, yb);
              ctx.strokeStyle = `hsla(${dot.hue}, 100%, 75%, ${layer.alpha * tb})`;
              ctx.lineWidth = layer.width;
              ctx.lineCap = "butt";
              ctx.stroke();
            }
          }
        }

        // ── Comet glow: radial gradient squashed along travel direction ──
        const angle = Math.atan2(dot.ty - dot.py, dot.tx - dot.px);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.scale(1.6, 0.42); // less pointy forward, still comet-shaped
        const grd = ctx.createRadialGradient(-2, 0, 0, -2, 0, 9);
        grd.addColorStop(0,   `hsla(${dot.hue}, 100%, 90%, 0.45)`);
        grd.addColorStop(0.5, `hsla(${dot.hue}, 100%, 75%, 0.15)`);
        grd.addColorStop(1,   `hsla(${dot.hue}, 100%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(-1, 0, 9, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.restore();

        // Bright tip
        ctx.beginPath();
        ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dynamic light following mouse */}
      <div ref={lightRef} className="absolute inset-0 z-[1]" />

      {/* Grid — origin at (0,0) aligns with canvas dots */}
      <div
        className="absolute inset-0 z-[-2] opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID}px ${GRID}px`,
          backgroundPosition: "0px 0px",
        }}
      />

      {/* Data packets navigating the grid */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Subtle film-grain texture */}
      <svg className="absolute inset-0 w-full h-full z-[2] opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0 z-[3] bg-black/10 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black_95%)]" />
    </div>
  );
}
