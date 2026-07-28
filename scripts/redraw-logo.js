/**
 * Perfect Aquilar mark from brand artwork.
 *
 * Source: brand large mark (vector-designed, rendered clean in JPG)
 * Pipeline:
 *   1) High-res hard mask from brand art
 *   2) Potrace curve fit
 *   3) Resample → RDP (remove residual wobble, keep structure)
 *   4) Catmull-Rom smooth cubics with low overshoot
 *   5) Force sharp peak corner
 *   6) Export SVG + 3000 black PNG
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
function perp(p, a, b) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}
function rdp(pts, eps) {
  if (pts.length < 3) return pts.slice();
  let maxD = 0,
    maxI = 0;
  const end = pts.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perp(pts[i], pts[0], pts[end]);
    if (d > maxD) {
      maxD = d;
      maxI = i;
    }
  }
  if (maxD > eps) {
    const L = rdp(pts.slice(0, maxI + 1), eps);
    const R = rdp(pts.slice(maxI), eps);
    return L.slice(0, -1).concat(R);
  }
  return [pts[0], pts[end]];
}
function round(n) {
  return Math.round(n * 100) / 100;
}

function sampleCubic(p0, p1, p2, p3, n = 8) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n,
      u = 1 - t;
    out.push([
      u * u * u * p0[0] +
        3 * u * u * t * p1[0] +
        3 * u * t * t * p2[0] +
        t * t * t * p3[0],
      u * u * u * p0[1] +
        3 * u * u * t * p1[1] +
        3 * u * t * t * p2[1] +
        t * t * t * p3[1],
    ]);
  }
  return out;
}

function pathToPoints(d) {
  const commands = d.match(/[MLCZHVmlczhv][^MLCZHVmlczhv]*/g) || [];
  const contours = [];
  let pts = [];
  let cx = 0,
    cy = 0,
    sx = 0,
    sy = 0;
  const nums = (s) =>
    (s.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
  const flush = () => {
    if (pts.length > 2) contours.push(pts);
    pts = [];
  };

  for (const cmd of commands) {
    const t = cmd[0];
    const a = nums(cmd.slice(1));
    if (t === "M" || t === "m") {
      flush();
      if (t === "m") {
        cx += a[0];
        cy += a[1];
      } else {
        cx = a[0];
        cy = a[1];
      }
      sx = cx;
      sy = cy;
      pts.push([cx, cy]);
      for (let i = 2; i < a.length; i += 2) {
        if (t === "m") {
          cx += a[i];
          cy += a[i + 1];
        } else {
          cx = a[i];
          cy = a[i + 1];
        }
        pts.push([cx, cy]);
      }
    } else if (t === "L" || t === "l") {
      for (let i = 0; i < a.length; i += 2) {
        if (t === "l") {
          cx += a[i];
          cy += a[i + 1];
        } else {
          cx = a[i];
          cy = a[i + 1];
        }
        pts.push([cx, cy]);
      }
    } else if (t === "H" || t === "h") {
      for (const v of a) {
        cx = t === "h" ? cx + v : v;
        pts.push([cx, cy]);
      }
    } else if (t === "V" || t === "v") {
      for (const v of a) {
        cy = t === "v" ? cy + v : v;
        pts.push([cx, cy]);
      }
    } else if (t === "C" || t === "c") {
      for (let i = 0; i < a.length; i += 6) {
        const p0 = [cx, cy];
        let p1, p2, p3;
        if (t === "c") {
          p1 = [cx + a[i], cy + a[i + 1]];
          p2 = [cx + a[i + 2], cy + a[i + 3]];
          p3 = [cx + a[i + 4], cy + a[i + 5]];
        } else {
          p1 = [a[i], a[i + 1]];
          p2 = [a[i + 2], a[i + 3]];
          p3 = [a[i + 4], a[i + 5]];
        }
        pts.push(...sampleCubic(p0, p1, p2, p3, 6).slice(1));
        cx = p3[0];
        cy = p3[1];
      }
    } else if (t === "Z" || t === "z") {
      pts.push([sx, sy]);
      flush();
      cx = sx;
      cy = sy;
    }
  }
  flush();
  return contours;
}

function cornerAngle(p0, p1, p2) {
  const a = Math.atan2(p0[1] - p1[1], p0[0] - p1[0]);
  const b = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  let d = Math.abs(a - b);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return d; // radians, small = sharp spike, ~PI = straight
}

function toPath(points) {
  let pts = points.slice();
  if (pts.length > 2 && dist(pts[0], pts[pts.length - 1]) < 1) {
    pts = pts.slice(0, -1);
  }
  const n = pts.length;
  if (n < 3) return "";

  // Peak first
  let peakI = 0;
  for (let i = 1; i < n; i++) {
    if (pts[i][1] < pts[peakI][1]) peakI = i;
  }
  pts = pts.slice(peakI).concat(pts.slice(0, peakI));

  let d = `M${round(pts[0][0])} ${round(pts[0][1])}`;

  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    // Sharp corners (peak, feet): use straight segment for crisp merch edges
    const ang = cornerAngle(p0, p1, p2);
    const sharp = ang < 2.4; // less than ~137° interior-ish → corner

    if (sharp && i !== 0) {
      // arrive at p1 already; go straight to p2
      d += `L${round(p2[0])} ${round(p2[1])}`;
      continue;
    }

    // Smooth cubic with low overshoot
    const nearPeak = i === 0 || i === 1 || i === n - 1;
    const k = nearPeak ? 14 : 8;
    const c1x = p1[0] + (p2[0] - p0[0]) / k;
    const c1y = p1[1] + (p2[1] - p0[1]) / k;
    const c2x = p2[0] - (p3[0] - p1[0]) / k;
    const c2y = p2[1] - (p3[1] - p1[1]) / k;
    d += `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  d += "Z";
  return d;
}

function normalize(contours) {
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
  const pad = 4;
  const scale = (100 - pad * 2) / Math.max(bw, bh);
  const ox = pad + ((100 - pad * 2) - bw * scale) / 2;
  const oy = pad + ((100 - pad * 2) - bh * scale) / 2;
  return contours.map((c) =>
    c.map(([x, y]) => [ox + (x - minX) * scale, oy + (y - minY) * scale])
  );
}

async function makeBrandBw(size) {
  // Prefer brand large crop; fall back to logo-mark.png
  let src = path.join(assets, "_ref-large.png");
  if (!fs.existsSync(src)) src = path.join(assets, "logo-mark.png");

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize(size, size, {
      fit: "contain",
      background: { r: 20, g: 28, b: 40, alpha: 1 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rgb = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const a = channels > 3 ? data[i * channels + 3] : 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Brand art: white logo on dark navy → black logo on white for potrace
    const isLogo = lum > 150 && a > 200;
    const v = isLogo ? 0 : 255;
    rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = v;
  }
  return sharp(rgb, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

async function main() {
  const SIZE = 1600;
  const bw = await makeBrandBw(SIZE);

  // Save debug mask
  await sharp(bw).toFile(path.join(assets, "_trace-source.png"));

  // Potrace — moderate opt for accurate topology
  const svgRaw = await trace(bw, {
    color: "#000000",
    background: "transparent",
    threshold: 128,
    optTolerance: 0.35,
    turdSize: 30,
    alphamax: 1.0,
    turnPolicy: "minority",
  });

  const dList = [...svgRaw.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  console.log("potrace paths", dList.length);

  let contours = [];
  for (const d of dList) contours = contours.concat(pathToPoints(d));
  console.log(
    "contours",
    contours.map((c) => c.length)
  );

  // Sort largest first (outer), simplify
  contours = contours
    .filter((c) => c.length > 40)
    .map((c) => {
      let ring = c.slice();
      if (ring.length > 2 && dist(ring[0], ring[ring.length - 1]) < 2) {
        ring = ring.slice(0, -1);
      }
      // Slightly tighter eps preserves wing tip + foot corners
      let s = rdp(ring, 2.8);
      if (s.length < 20) s = rdp(ring, 2.0);
      if (s.length < 12) s = rdp(ring, 1.4);
      console.log("simplify", ring.length, "->", s.length);
      return s;
    })
    .filter((c) => c.length >= 8)
    .sort((a, b) => b.length - a.length);

  const normed = normalize(contours);
  const pathD = normed.map((c) => toPath(c)).join("");
  console.log("final curves", (pathD.match(/C/g) || []).length, "len", pathD.length);

  const make = (fill) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aquilar Group"
  viewBox="0 0 100 100" width="512" height="512">
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

  // Preview
  await sharp(Buffer.from(white))
    .resize(1000, 1000, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png()
    .toFile(path.join(assets, "logo-mark-clean-preview.png"));

  // Edge detail
  await sharp(path.join(assets, "logo-mark-clean-preview.png"))
    .extract({ left: 240, top: 40, width: 360, height: 420 })
    .resize(1080, 1260, { kernel: "nearest" })
    .png()
    .toFile(path.join(assets, "logo-mark-clean-edge-detail.png"));

  // Side-by-side with brand
  const brand = await sharp(path.join(assets, "_brand-mask.png"))
    .resize(480, 480, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png()
    .toBuffer();
  const redraw = await sharp(path.join(assets, "logo-mark-clean-preview.png"))
    .resize(480, 480)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1000,
      height: 520,
      channels: 3,
      background: { r: 8, g: 8, b: 8 },
    },
  })
    .composite([
      { input: brand, left: 20, top: 20 },
      { input: redraw, left: 520, top: 20 },
    ])
    .png()
    .toFile(path.join(assets, "logo-side-by-side.png"));

  // 3000 black
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

  // Diff overlay
  const b = await sharp(path.join(assets, "_brand-mask.png"))
    .resize(500, 500, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const r = await sharp(Buffer.from(white))
    .resize(500, 500, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(500 * 500 * 3);
  let match = 0,
    brandOnly = 0,
    redrawOnly = 0,
    solid = 0;
  for (let i = 0; i < 500 * 500; i++) {
    const bo = b.data[i * b.info.channels] > 128;
    const ro = r.data[i * r.info.channels] > 128;
    if (bo || ro) solid++;
    if (bo && ro) {
      out[i * 3] = 200;
      out[i * 3 + 1] = 200;
      out[i * 3 + 2] = 50;
      match++;
    } else if (bo) {
      out[i * 3] = 230;
      out[i * 3 + 1] = 50;
      out[i * 3 + 2] = 50;
      brandOnly++;
    } else if (ro) {
      out[i * 3] = 50;
      out[i * 3 + 1] = 210;
      out[i * 3 + 2] = 90;
      redrawOnly++;
    }
  }
  await sharp(out, { raw: { width: 500, height: 500, channels: 3 } })
    .png()
    .toFile(path.join(assets, "logo-overlay-diff.png"));

  console.log(
    `MATCH ${((match / solid) * 100).toFixed(1)}% | brand-only ${((brandOnly / solid) * 100).toFixed(1)}% | extra ${((redrawOnly / solid) * 100).toFixed(1)}%`
  );
  console.log("Files ready:");
  console.log("  logo-mark.svg / -black / -white / -cream");
  console.log("  logo-mark-3000-black.png");
  console.log("  logo-mark-3000-black-on-white.png");
  console.log("  logo-side-by-side.png (brand left, redraw right)");
  console.log("  logo-overlay-diff.png (yellow=match)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
