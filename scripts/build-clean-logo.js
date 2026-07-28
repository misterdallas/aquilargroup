/**
 * Merch-sharp Aquilar mark:
 * 1) Potrace for correct topology
 * 2) Densify path → RDP simplify (kills micro-wobble)
 * 3) Refit as smooth cubics
 * 4) Export SVG + 3000 black PNG
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const potrace = require("potrace");
const { promisify } = require("util");

const trace = promisify(potrace.trace);
const assets = path.join(__dirname, "..", "site", "assets");

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function perpDist(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

function rdp(points, eps) {
  if (points.length < 3) return points.slice();
  let maxD = 0,
    maxI = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpDist(points[i], points[0], points[end]);
    if (d > maxD) {
      maxD = d;
      maxI = i;
    }
  }
  if (maxD > eps) {
    const L = rdp(points.slice(0, maxI + 1), eps);
    const R = rdp(points.slice(maxI), eps);
    return L.slice(0, -1).concat(R);
  }
  return [points[0], points[end]];
}

/** Sample a cubic bezier */
function sampleCubic(p0, p1, p2, p3, n = 12) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const x =
      u * u * u * p0[0] +
      3 * u * u * t * p1[0] +
      3 * u * t * t * p2[0] +
      t * t * t * p3[0];
    const y =
      u * u * u * p0[1] +
      3 * u * u * t * p1[1] +
      3 * u * t * t * p2[1] +
      t * t * t * p3[1];
    out.push([x, y]);
  }
  return out;
}

/** Parse SVG path d into polyline samples (absolute + relative M/L/C/H/V/Z) */
function pathToPoints(d) {
  const commands = d.match(/[MLCZHVmlczhv][^MLCZHVmlczhv]*/g) || [];
  const contours = [];
  let pts = [];
  let cx = 0,
    cy = 0;
  let startX = 0,
    startY = 0;

  const nums = (s) =>
    (s.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);

  const flush = () => {
    if (pts.length > 2) contours.push(pts);
    pts = [];
  };

  for (const cmd of commands) {
    const type = cmd[0];
    const args = nums(cmd.slice(1));
    const rel = type === type.toLowerCase() && type !== "z";

    if (type === "M" || type === "m") {
      flush();
      if (rel) {
        cx += args[0];
        cy += args[1];
      } else {
        cx = args[0];
        cy = args[1];
      }
      startX = cx;
      startY = cy;
      pts.push([cx, cy]);
      for (let i = 2; i < args.length; i += 2) {
        if (rel) {
          cx += args[i];
          cy += args[i + 1];
        } else {
          cx = args[i];
          cy = args[i + 1];
        }
        pts.push([cx, cy]);
      }
    } else if (type === "L" || type === "l") {
      for (let i = 0; i < args.length; i += 2) {
        if (rel) {
          cx += args[i];
          cy += args[i + 1];
        } else {
          cx = args[i];
          cy = args[i + 1];
        }
        pts.push([cx, cy]);
      }
    } else if (type === "H" || type === "h") {
      for (const v of args) {
        cx = type === "h" ? cx + v : v;
        pts.push([cx, cy]);
      }
    } else if (type === "V" || type === "v") {
      for (const v of args) {
        cy = type === "v" ? cy + v : v;
        pts.push([cx, cy]);
      }
    } else if (type === "C" || type === "c") {
      for (let i = 0; i < args.length; i += 6) {
        const p0 = [cx, cy];
        let p1, p2, p3;
        if (type === "c") {
          p1 = [cx + args[i], cy + args[i + 1]];
          p2 = [cx + args[i + 2], cy + args[i + 3]];
          p3 = [cx + args[i + 4], cy + args[i + 5]];
        } else {
          p1 = [args[i], args[i + 1]];
          p2 = [args[i + 2], args[i + 3]];
          p3 = [args[i + 4], args[i + 5]];
        }
        const samples = sampleCubic(p0, p1, p2, p3, 8);
        pts.push(...samples.slice(1));
        cx = p3[0];
        cy = p3[1];
      }
    } else if (type === "Z" || type === "z") {
      pts.push([startX, startY]);
      flush();
      cx = startX;
      cy = startY;
    }
  }
  flush();
  return contours;
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function pointsToSmoothPath(points, closed = true) {
  // Points already simplified in pixel space; lightly clean duplicates only
  let pts = points.slice();
  if (
    closed &&
    pts.length > 2 &&
    dist(pts[0], pts[pts.length - 1]) < 0.5
  ) {
    pts = pts.slice(0, -1);
  }

  const n = pts.length;
  if (n < 3) return "";

  // Catmull-Rom → cubic (closed loop)
  let d = `M${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    // /8 tension = less Catmull overshoot at sharp corners (peak/feet)
    const c1x = p1[0] + (p2[0] - p0[0]) / 8;
    const c1y = p1[1] + (p2[1] - p0[1]) / 8;
    const c2x = p2[0] - (p3[0] - p1[0]) / 8;
    const c2y = p2[1] - (p3[1] - p1[1]) / 8;
    d += `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  if (closed) d += "Z";
  return d;
}

function normalizeToViewBox(contours, pad = 4) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const c of contours) {
    for (const [x, y] of c) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const bw = maxX - minX || 1;
  const bh = maxY - minY || 1;
  const scale = (100 - pad * 2) / Math.max(bw, bh);
  const ox = pad + ((100 - pad * 2) - bw * scale) / 2;
  const oy = pad + ((100 - pad * 2) - bh * scale) / 2;
  return contours.map((c) =>
    c.map(([x, y]) => [ox + (x - minX) * scale, oy + (y - minY) * scale])
  );
}

async function main() {
  // Hard B&W at solid res
  const { data, info } = await sharp(path.join(assets, "logo-mark.png"))
    .ensureAlpha()
    .resize(1400, 1400, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rgb = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    const v = data[i * channels + 3] > 175 ? 0 : 255;
    rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = v;
  }
  const bw = await sharp(rgb, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();

  // Potrace for correct topology (bumpy is ok — we re-smooth next)
  const svgRaw = await trace(bw, {
    color: "#000000",
    background: "transparent",
    threshold: 128,
    optTolerance: 0.4,
    turdSize: 40,
    alphamax: 1.0,
    turnPolicy: "minority",
  });

  const dAll = [...svgRaw.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  console.log("potrace subpaths", dAll.length);

  let contours = [];
  for (const d of dAll) {
    contours = contours.concat(pathToPoints(d));
  }
  console.log(
    "contours",
    contours.length,
    "pts",
    contours.map((c) => c.length)
  );

  // Keep significant contours only, simplify in pixel space first
  contours = contours
    .filter((c) => c.length > 30)
    .map((c) => {
      // Drop closing duplicate so RDP doesn't collapse the loop
      let ring = c.slice();
      if (ring.length > 2 && dist(ring[0], ring[ring.length - 1]) < 2) {
        ring = ring.slice(0, -1);
      }
      // RDP in source pixel space — higher eps = smoother long edges
      // Outer contours are longer; holes need a bit more detail
      const isOuter = ring.length > 1000;
      let s = rdp(ring, isOuter ? 7 : 4);
      if (s.length < 14) s = rdp(ring, isOuter ? 4 : 2.5);
      if (s.length < 8) s = rdp(ring, 1.8);
      console.log(
        "contour simplified",
        ring.length,
        "->",
        s.length,
        isOuter ? "(outer)" : "(hole)"
      );
      return s;
    })
    .filter((c) => c.length >= 6);

  const normed = normalizeToViewBox(contours, 3);

  const pathD = normed
    .map((c) => pointsToSmoothPath(c, true))
    .filter(Boolean)
    .join("");

  console.log(
    "final C-curves",
    (pathD.match(/C/g) || []).length,
    "pathLen",
    pathD.length
  );

  const make = (fill) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aquilar Group"
  viewBox="0 0 100 100" width="100" height="100">
  <path fill="${fill}" fill-rule="evenodd" d="${pathD}"/>
</svg>
`;

  const black = make("#000000");
  const white = make("#FFFFFF");
  const cream = make("#E8E0D0");
  const current = make("currentColor");

  fs.writeFileSync(path.join(assets, "logo-mark.svg"), current);
  fs.writeFileSync(path.join(assets, "logo-mark-black.svg"), black);
  fs.writeFileSync(path.join(assets, "logo-mark-white.svg"), white);
  fs.writeFileSync(path.join(assets, "logo-mark-cream.svg"), cream);

  await sharp(Buffer.from(white))
    .resize(1100, 1100, {
      fit: "contain",
      background: { r: 10, g: 10, b: 10, alpha: 1 },
    })
    .png()
    .toFile(path.join(assets, "logo-mark-clean-preview.png"));

  // Extreme edge zoom
  await sharp(path.join(assets, "logo-mark-clean-preview.png"))
    .extract({ left: 260, top: 50, width: 420, height: 480 })
    .resize(840, 960, { kernel: "nearest" })
    .png()
    .toFile(path.join(assets, "logo-mark-clean-edge-detail.png"));

  await sharp(Buffer.from(black))
    .resize(3000, 3000, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(assets, "logo-mark-3000-black.png"));

  await sharp(Buffer.from(black))
    .resize(3000, 3000, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(path.join(assets, "logo-mark-3000-black-on-white.png"));

  // cleanup temp
  for (const f of fs.readdirSync(assets)) {
    if (f.startsWith("_geo-") || f.startsWith("_qa-") || f.startsWith("_tol")) {
      try {
        fs.unlinkSync(path.join(assets, f));
      } catch (_) {}
    }
  }

  console.log("Done — merch assets ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
