/**
 * Shared Three.js helpers — ES module
 * Three is vendored locally so mobile is not blocked by CDN failures.
 */
import * as THREE from "./vendor/three.module.min.js";

export { THREE };

function isMobile() {
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
  );
}

/**
 * Create a WebGL renderer bound to a canvas inside a sized parent.
 * Mobile-safe: lower DPR, default power preference, wait for layout size.
 */
export function createRenderer(canvas) {
  const parent = canvas.parentElement;
  const mobile = isMobile();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: true,
      powerPreference: mobile ? "default" : "high-performance",
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false,
    });
  } catch (err) {
    console.error("[Aquilar] WebGL init failed:", err);
    parent?.classList.add("viz-fallback");
    throw err;
  }

  renderer.setClearColor(0x000000, 0);
  // Cap pixel ratio hard on phones — high DPR + WebGL is a common mobile fail
  const maxDpr = mobile ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

  function resize() {
    const w = Math.max(parent.clientWidth || canvas.clientWidth || 1, 1);
    const h = Math.max(parent.clientHeight || canvas.clientHeight || 1, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return { w, h };
  }

  // Layout can be 0×0 on first paint (mobile stack) — retry until sized
  let attempts = 0;
  function ensureSize() {
    const { w, h } = resize();
    if ((w < 2 || h < 2) && attempts < 30) {
      attempts += 1;
      requestAnimationFrame(ensureSize);
    }
  }
  ensureSize();

  let ro;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(() => resize());
    ro.observe(parent);
  }
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => {
    setTimeout(resize, 150);
  });

  return { renderer, camera, parent, resize, THREE };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Orange wireframe grid plane for tactical feel */
export function makeGrid(size = 6, divisions = 12) {
  const grid = new THREE.GridHelper(size, divisions, 0xff5a00, 0x3a1808);
  if (Array.isArray(grid.material)) {
    grid.material.forEach((m) => {
      m.transparent = true;
      m.opacity = 0.35;
    });
  } else {
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
  }
  return grid;
}
