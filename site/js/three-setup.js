/**
 * Shared Three.js helpers — ES module
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

export { THREE };

/**
 * Create a WebGL renderer bound to a canvas inside a sized parent.
 */
export function createRenderer(canvas) {
  const parent = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

  function resize() {
    const w = Math.max(parent.clientWidth, 1);
    const h = Math.max(parent.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(parent);
  window.addEventListener("resize", resize);

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
