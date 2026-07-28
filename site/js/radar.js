/**
 * Animated radar / formation sweep — Operations
 */
import {
  THREE,
  createRenderer,
  prefersReducedMotion,
  makeGrid,
} from "./three-setup.js";

const canvas = document.getElementById("viz-canvas");
if (canvas) {
  const reduceMotion = prefersReducedMotion();
  const { renderer, camera } = createRenderer(canvas);
  camera.position.set(0, 4.2, 0.05);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);

  const grid = makeGrid(7, 14);
  grid.position.y = 0;
  scene.add(grid);

  // Concentric rings
  const ringMat = new THREE.LineBasicMaterial({
    color: 0xff5a00,
    transparent: true,
    opacity: 0.4,
  });
  [0.7, 1.4, 2.1, 2.8].forEach((r) => {
    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0.02, Math.sin(a) * r));
    }
    root.add(
      new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMat)
    );
  });

  // Cross hairs
  const axisMat = new THREE.LineBasicMaterial({
    color: 0xff5a00,
    transparent: true,
    opacity: 0.25,
  });
  root.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-3, 0.02, 0),
        new THREE.Vector3(3, 0.02, 0),
      ]),
      axisMat
    )
  );
  root.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.02, -3),
        new THREE.Vector3(0, 0.02, 3),
      ]),
      axisMat
    )
  );

  // Sweep wedge (fan of lines)
  const sweepGroup = new THREE.Group();
  root.add(sweepGroup);
  const sweepMat = new THREE.LineBasicMaterial({
    color: 0xffa040,
    transparent: true,
    opacity: 0.55,
  });
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * 0.55;
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.04, 0),
        new THREE.Vector3(Math.cos(a) * 2.9, 0.04, Math.sin(a) * 2.9),
      ]),
      sweepMat.clone()
    );
    line.material.opacity = 0.15 + (i / 18) * 0.5;
    sweepGroup.add(line);
  }

  // Formation contacts
  const contacts = [];
  const contactData = [
    [1.2, 0.8],
    [-1.5, 1.1],
    [0.4, -1.7],
    [-0.9, -1.2],
    [2.0, -0.3],
    [-2.1, 0.4],
    [1.6, 1.8],
    [-0.3, 2.2],
  ];

  contactData.forEach(([x, z], i) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffc060 })
    );
    m.position.set(x, 0.08, z);
    m.userData.phase = i;
    root.add(m);
    contacts.push(m);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.16, 24),
      new THREE.MeshBasicMaterial({
        color: 0xff5a00,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.05, z);
    root.add(ring);
    contacts.push(ring);
  });

  // Center hub
  root.add(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0xff5a00 })
    )
  );

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.014;
    if (!reduceMotion) {
      sweepGroup.rotation.y = t * 1.1;
      contacts.forEach((c, i) => {
        const pulse = 1 + Math.sin(t * 3 + i) * 0.15;
        c.scale.setScalar(pulse);
      });
    }
    renderer.render(scene, camera);
  }
  animate();
}
