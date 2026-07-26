"use client";

import { useEffect, useRef } from "react";
import styles from "./GlobeViz.module.css";

/** Wireframe globe with glowing network nodes — matches Home concept image */
export default function GlobeViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let rotation = 0;
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

    // Lat/lon node network (field-tested coverage points)
    const nodes: { lat: number; lon: number; pulse: number }[] = [
      { lat: 38.9, lon: -77.0, pulse: 0 }, // DC
      { lat: 33.7, lon: -84.4, pulse: 0.3 }, // Atlanta
      { lat: 32.9, lon: -97.0, pulse: 0.6 }, // Dallas
      { lat: 34.0, lon: -118.2, pulse: 0.2 }, // LA
      { lat: 47.6, lon: -122.3, pulse: 0.8 }, // Seattle
      { lat: 51.5, lon: -0.1, pulse: 0.4 }, // London
      { lat: 48.8, lon: 2.3, pulse: 0.7 }, // Paris
      { lat: 52.5, lon: 13.4, pulse: 0.1 }, // Berlin
      { lat: 25.2, lon: 55.3, pulse: 0.5 }, // Dubai
      { lat: 1.3, lon: 103.8, pulse: 0.9 }, // Singapore
      { lat: 35.7, lon: 139.7, pulse: 0.25 }, // Tokyo
      { lat: -33.9, lon: 151.2, pulse: 0.55 }, // Sydney
      { lat: 28.6, lon: 77.2, pulse: 0.15 }, // Delhi
      { lat: -23.5, lon: -46.6, pulse: 0.45 }, // São Paulo
      { lat: 19.4, lon: -99.1, pulse: 0.35 }, // Mexico City
      { lat: 64.1, lon: -21.9, pulse: 0.65 }, // Reykjavik
      { lat: 37.5, lon: 127.0, pulse: 0.85 }, // Seoul
      { lat: 41.0, lon: 28.9, pulse: 0.2 }, // Istanbul
    ];

    const links: [number, number][] = [
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [5, 8],
      [8, 9],
      [9, 10],
      [10, 11],
      [9, 12],
      [2, 14],
      [14, 13],
      [0, 15],
      [10, 16],
      [7, 17],
      [4, 10],
      [1, 14],
    ];

    const project = (
      lat: number,
      lon: number,
      cx: number,
      cy: number,
      r: number,
      rot: number
    ) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lon + rot) * Math.PI) / 180;
      const x3 = r * Math.sin(phi) * Math.cos(theta);
      const y3 = r * Math.cos(phi);
      const z3 = r * Math.sin(phi) * Math.sin(theta);
      // Tilt for isometric feel
      const tilt = 0.35;
      const y = y3 * Math.cos(tilt) - z3 * Math.sin(tilt);
      const z = y3 * Math.sin(tilt) + z3 * Math.cos(tilt);
      return {
        x: cx + x3,
        y: cy + y,
        z,
        visible: z > -r * 0.15,
      };
    };

    const drawMeridians = (
      cx: number,
      cy: number,
      r: number,
      rot: number
    ) => {
      ctx.strokeStyle = "rgba(255, 90, 0, 0.22)";
      ctx.lineWidth = 1;

      // Latitude rings
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = 0; lon <= 360; lon += 4) {
          const p = project(lat, lon, cx, cy, r, rot);
          if (p.z < -r * 0.05) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // Longitude arcs
      for (let lon = 0; lon < 360; lon += 20) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = project(lat, lon, cx, cy, r, rot);
          if (p.z < -r * 0.05) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }
    };

    const draw = (t: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.52;
      const r = Math.min(w, h) * 0.38;

      if (!reduceMotion) {
        rotation = (t * 0.008) % 360;
      }

      // Outer glow ring
      const glow = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.25);
      glow.addColorStop(0, "rgba(255, 90, 0, 0.08)");
      glow.addColorStop(0.6, "rgba(255, 90, 0, 0.03)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Sphere body
      const body = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r);
      body.addColorStop(0, "rgba(40, 28, 18, 0.55)");
      body.addColorStop(0.55, "rgba(18, 14, 10, 0.75)");
      body.addColorStop(1, "rgba(8, 8, 8, 0.9)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Limb edge
      ctx.strokeStyle = "rgba(255, 90, 0, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      drawMeridians(cx, cy, r, rotation);

      // Projected nodes
      const projected = nodes.map((n, i) => {
        const p = project(n.lat, n.lon, cx, cy, r, rotation);
        const pulse = 0.55 + 0.45 * Math.sin(t * 0.003 + n.pulse * Math.PI * 2 + i);
        return { ...p, pulse, i };
      });

      // Links
      for (const [a, b] of links) {
        const pa = projected[a];
        const pb = projected[b];
        if (!pa.visible || !pb.visible) continue;
        const alpha = 0.15 + 0.2 * ((pa.z + pb.z) / (2 * r) + 0.5);
        ctx.strokeStyle = `rgba(255, 90, 0, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // Nodes
      for (const p of projected) {
        if (!p.visible) continue;
        const size = 2.2 + p.pulse * 2.2;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3.5);
        g.addColorStop(0, `rgba(255, 140, 40, ${0.55 + p.pulse * 0.35})`);
        g.addColorStop(0.4, `rgba(255, 90, 0, ${0.25 + p.pulse * 0.2})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 200, 120, ${0.75 + p.pulse * 0.25})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scan arc accent
      if (!reduceMotion) {
        const scan = ((t * 0.04) % 360) * (Math.PI / 180);
        ctx.strokeStyle = "rgba(255, 90, 0, 0.18)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.05, scan, scan + 0.55);
        ctx.stroke();
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
