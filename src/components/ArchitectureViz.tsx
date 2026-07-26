"use client";

import { useEffect, useRef } from "react";
import styles from "./ArchitectureViz.module.css";

/** Circuit-board + 3D cube architecture — matches Systems concept image */
export default function ArchitectureViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Pt = { x: number; y: number };
    type Node = Pt & { r: number; phase: number; kind: "hex" | "cube" | "dot" };

    const nodes: Node[] = [
      { x: 0.5, y: 0.48, r: 1, phase: 0, kind: "cube" },
      { x: 0.28, y: 0.32, r: 0.55, phase: 0.4, kind: "cube" },
      { x: 0.72, y: 0.3, r: 0.5, phase: 0.8, kind: "cube" },
      { x: 0.22, y: 0.62, r: 0.45, phase: 1.2, kind: "hex" },
      { x: 0.78, y: 0.58, r: 0.48, phase: 1.6, kind: "hex" },
      { x: 0.5, y: 0.22, r: 0.35, phase: 0.2, kind: "hex" },
      { x: 0.5, y: 0.78, r: 0.38, phase: 1.0, kind: "hex" },
      { x: 0.15, y: 0.45, r: 0.22, phase: 0.6, kind: "dot" },
      { x: 0.85, y: 0.42, r: 0.22, phase: 1.4, kind: "dot" },
      { x: 0.38, y: 0.55, r: 0.18, phase: 0.9, kind: "dot" },
      { x: 0.62, y: 0.52, r: 0.18, phase: 1.8, kind: "dot" },
    ];

    const traces: [number, number][] = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [1, 5],
      [2, 5],
      [3, 6],
      [4, 6],
      [1, 7],
      [2, 8],
      [0, 9],
      [0, 10],
      [3, 7],
      [4, 8],
    ];

    const drawIsometricCube = (
      x: number,
      y: number,
      size: number,
      pulse: number
    ) => {
      const s = size;
      const h = s * 0.58;
      // top
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x + s, y - h * 0.45);
      ctx.lineTo(x, y + h * 0.1);
      ctx.lineTo(x - s, y - h * 0.45);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 120, 30, ${0.12 + pulse * 0.1})`;
      ctx.strokeStyle = `rgba(255, 160, 60, ${0.55 + pulse * 0.3})`;
      ctx.lineWidth = 1.4;
      ctx.fill();
      ctx.stroke();

      // left face
      ctx.beginPath();
      ctx.moveTo(x - s, y - h * 0.45);
      ctx.lineTo(x, y + h * 0.1);
      ctx.lineTo(x, y + h * 0.95);
      ctx.lineTo(x - s, y + h * 0.4);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 90, 0, ${0.08 + pulse * 0.06})`;
      ctx.strokeStyle = `rgba(255, 120, 40, ${0.4 + pulse * 0.25})`;
      ctx.fill();
      ctx.stroke();

      // right face
      ctx.beginPath();
      ctx.moveTo(x + s, y - h * 0.45);
      ctx.lineTo(x, y + h * 0.1);
      ctx.lineTo(x, y + h * 0.95);
      ctx.lineTo(x + s, y + h * 0.4);
      ctx.closePath();
      ctx.fillStyle = `rgba(180, 70, 10, ${0.1 + pulse * 0.06})`;
      ctx.strokeStyle = `rgba(255, 100, 30, ${0.35 + pulse * 0.2})`;
      ctx.fill();
      ctx.stroke();
    };

    const drawHex = (x: number, y: number, r: number, pulse: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(255, 140, 50, ${0.35 + pulse * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 90, 0, ${0.04 + pulse * 0.05})`;
      ctx.fill();
    };

    const draw = (t: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // PCB-style background traces (grid circuits)
      ctx.strokeStyle = "rgba(255, 90, 0, 0.12)";
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = step; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = step; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Organic PCB routes
      const routes: Pt[][] = [
        [
          { x: 0.08, y: 0.2 },
          { x: 0.2, y: 0.2 },
          { x: 0.2, y: 0.35 },
          { x: 0.28, y: 0.35 },
        ],
        [
          { x: 0.92, y: 0.18 },
          { x: 0.78, y: 0.18 },
          { x: 0.78, y: 0.32 },
          { x: 0.7, y: 0.32 },
        ],
        [
          { x: 0.1, y: 0.85 },
          { x: 0.25, y: 0.85 },
          { x: 0.25, y: 0.7 },
          { x: 0.35, y: 0.7 },
        ],
        [
          { x: 0.9, y: 0.82 },
          { x: 0.75, y: 0.82 },
          { x: 0.75, y: 0.68 },
          { x: 0.65, y: 0.68 },
        ],
        [
          { x: 0.5, y: 0.08 },
          { x: 0.5, y: 0.18 },
        ],
        [
          { x: 0.5, y: 0.92 },
          { x: 0.5, y: 0.82 },
        ],
      ];

      ctx.strokeStyle = "rgba(255, 110, 30, 0.35)";
      ctx.lineWidth = 1.5;
      for (const route of routes) {
        ctx.beginPath();
        route.forEach((p, i) => {
          const px = p.x * w;
          const py = p.y * h;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      // Node connections
      for (const [a, b] of traces) {
        const na = nodes[a];
        const nb = nodes[b];
        const pulse =
          0.5 +
          0.5 *
            Math.sin(
              (reduceMotion ? 0 : t * 0.002) + na.phase + nb.phase
            );
        ctx.strokeStyle = `rgba(255, 100, 20, ${0.2 + pulse * 0.25})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        // Orthogonal-ish PCB path
        const ax = na.x * w;
        const ay = na.y * h;
        const bx = nb.x * w;
        const by = nb.y * h;
        const midX = (ax + bx) / 2;
        ctx.moveTo(ax, ay);
        ctx.lineTo(midX, ay);
        ctx.lineTo(midX, by);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Packet traveling along link
        if (!reduceMotion) {
          const u = (Math.sin(t * 0.0015 + a * 0.7 + b) + 1) / 2;
          let px: number, py: number;
          if (u < 0.33) {
            const k = u / 0.33;
            px = ax + (midX - ax) * k;
            py = ay;
          } else if (u < 0.66) {
            const k = (u - 0.33) / 0.33;
            px = midX;
            py = ay + (by - ay) * k;
          } else {
            const k = (u - 0.66) / 0.34;
            px = midX + (bx - midX) * k;
            py = by;
          }
          const g = ctx.createRadialGradient(px, py, 0, px, py, 6);
          g.addColorStop(0, "rgba(255, 200, 100, 0.9)");
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const pulse =
          0.5 +
          0.5 * Math.sin((reduceMotion ? n.phase : t * 0.0025) + n.phase * 3);
        const x = n.x * w;
        const y = n.y * h;
        const base = Math.min(w, h) * 0.07 * n.r;

        if (n.kind === "cube") {
          drawIsometricCube(x, y, base * 0.85, pulse);
        } else if (n.kind === "hex") {
          drawHex(x, y, base * 0.7, pulse);
        }

        // Core glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, base * 0.9);
        g.addColorStop(0, `rgba(255, 180, 80, ${0.55 + pulse * 0.35})`);
        g.addColorStop(0.35, `rgba(255, 90, 0, ${0.25 + pulse * 0.2})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, base * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 220, 150, ${0.8 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, 2 + pulse * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.vignette} />
    </div>
  );
}
