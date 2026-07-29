/**
 * Shared Three.js helpers — ES module
 * Vendored locally so Chrome/mobile are not blocked by CDN cache/CORS.
 */
import * as THREE from "./vendor/three.module.min.js?v=20260729b";

export { THREE };

function isMobile() {
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
  );
}

/**
 * Create a WebGL renderer bound to a canvas inside a sized parent.
 */
export function createRenderer(canvas) {
  const parent = canvas.parentElement;
  if (!parent) throw new Error("Canvas has no parent");

  const mobile = isMobile();

  // Ensure canvas participates in layout before measuring
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: true,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    });
  } catch (err) {
    console.error("[Aquilar] WebGL init failed:", err);
    parent.classList.add("viz-fallback");
    throw err;
  }

  renderer.setClearColor(0x000000, 0);
  const maxDpr = mobile ? 1.25 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

  function resize() {
    const rect = parent.getBoundingClientRect();
    const w = Math.max(Math.floor(rect.width) || parent.clientWidth || 300, 1);
    const h = Math.max(Math.floor(rect.height) || parent.clientHeight || 300, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return { w, h };
  }

  let attempts = 0;
  function ensureSize() {
    const { w, h } = resize();
    if ((w < 8 || h < 8) && attempts < 60) {
      attempts += 1;
      requestAnimationFrame(ensureSize);
    }
  }
  ensureSize();
  // Extra pass after layout/fonts (Chrome often needs this)
  setTimeout(resize, 50);
  setTimeout(resize, 250);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => resize()).observe(parent);
  }
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "orientationchange",
    () => setTimeout(resize, 200),
    { passive: true }
  );

  // Recover if context is lost (common on mobile Chrome tab switches)
  canvas.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      console.warn("[Aquilar] WebGL context lost — waiting to restore");
    },
    false
  );
  canvas.addEventListener(
    "webglcontextrestored",
    () => {
      resize();
    },
    false
  );

  return { renderer, camera, parent, resize, THREE };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Ambient motion: still animate lightly even when OS asks for reduced motion */
export function motionScale() {
  return prefersReducedMotion() ? 0.35 : 1;
}

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

/** Start a viz only after DOM is ready and canvas exists */
export function bootViz(initFn) {
  const run = () => {
    try {
      initFn();
    } catch (err) {
      console.error("[Aquilar] Viz boot failed:", err);
      const frame = document.querySelector(".hero-visual__frame");
      frame?.classList.add("viz-fallback");
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    // Defer one frame so CSS layout has applied (Chrome mobile)
    requestAnimationFrame(() => requestAnimationFrame(run));
  }
}
