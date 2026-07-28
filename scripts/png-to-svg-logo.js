/**
 * Vectorize site/assets/logo-mark.png → scalable SVG
 * Usage: node scripts/png-to-svg-logo.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ImageTracer = require("imagetracerjs");

const assets = path.join(__dirname, "..", "site", "assets");

async function main() {
  const { data, info } = await sharp(path.join(assets, "logo-mark.png"))
    .trim({ threshold: 15 })
    .resize(600, 600, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rgba = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const a = data[i * channels + 3];
    const y = Math.floor(i / width);
    // Drop faint bottom fringe
    const on = a > 130 && y < height * 0.985 ? 255 : 0;
    const o = i * 4;
    rgba[o] = on;
    rgba[o + 1] = on;
    rgba[o + 2] = on;
    rgba[o + 3] = 255;
  }

  let svg = ImageTracer.imagedataToSVG(
    { width, height, data: new Uint8ClampedArray(rgba) },
    {
      ltres: 0.8,
      qtres: 0.8,
      pathomit: 12,
      rightangleenhance: true,
      colorsampling: 0,
      numberofcolors: 2,
      mincolorratio: 0,
      colorquantcycles: 1,
      linefilter: true,
      scale: 1,
      roundcoords: 1,
      viewbox: true,
      desc: false,
      strokewidth: 0,
    }
  );

  // Remove near-black fill paths (background)
  svg = svg.replace(
    /<path[^>]*fill="rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)"[^>]*\/>/gi,
    ""
  );

  const pathTags = [...svg.matchAll(/<path\b[^>]*\/>/g)].map((m) => m[0]);
  const kept = pathTags.filter((p) => {
    const d = (p.match(/\sd="([^"]*)"/) || [])[1] || "";
    // drop tiny noise paths
    return d.length > 100;
  });

  const cleanedPaths = kept.map((p) =>
    p
      .replace(/fill="[^"]*"/g, 'fill="currentColor"')
      .replace(/stroke="[^"]*"/g, 'stroke="none"')
      .replace(/\sstroke-width="[^"]*"/g, "")
      .replace(/\sopacity="[^"]*"/g, "")
  );

  const final = [
    `<svg role="img" aria-label="Aquilar Group" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="512" height="512">`,
    ...cleanedPaths,
    `</svg>`,
    ``,
  ].join("\n");

  fs.writeFileSync(path.join(assets, "logo-mark.svg"), final);
  fs.writeFileSync(
    path.join(assets, "logo-mark-white.svg"),
    final.replace(/currentColor/g, "#FFFFFF")
  );
  fs.writeFileSync(
    path.join(assets, "logo-mark-cream.svg"),
    final.replace(/currentColor/g, "#E8E0D0")
  );

  await sharp(Buffer.from(final.replace(/currentColor/g, "#FFFFFF")))
    .resize(400, 400)
    .flatten({ background: "#0a0a0a" })
    .png()
    .toFile(path.join(assets, "logo-mark-svg-preview.png"));

  console.log("Wrote:");
  console.log("  site/assets/logo-mark.svg         (currentColor)");
  console.log("  site/assets/logo-mark-white.svg");
  console.log("  site/assets/logo-mark-cream.svg");
  console.log("paths:", cleanedPaths.length, "bytes:", final.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
