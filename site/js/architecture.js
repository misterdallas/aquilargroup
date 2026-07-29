/**
 * Animated architecture / node lattice — Systems
 */
import {
  THREE,
  createRenderer,
  motionScale,
  makeGrid,
  bootViz,
} from "./three-setup.js?v=20260729b";

bootViz(() => {
  const canvas = document.getElementById("viz-canvas");
  if (!canvas) return;

  const scale = motionScale();
  const { renderer, camera } = createRenderer(canvas);
  camera.fov = 45;
  camera.position.set(0, 1.55, 5.1);
  camera.lookAt(0, 0.15, 0);
  camera.updateProjectionMatrix();

  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);

  const grid = makeGrid(8, 16);
  grid.position.y = -1.15;
  scene.add(grid);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0xff6200,
    transparent: true,
    opacity: 0.55,
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xffa040,
    transparent: true,
    opacity: 0.9,
  });
  const fillMat = new THREE.MeshBasicMaterial({
    color: 0xff5a00,
    transparent: true,
    opacity: 0.14,
  });

  const nodes = [
    { p: [0, 0.35, 0], type: "cube", s: 0.58 },
    { p: [-1.45, 0.55, -0.55], type: "cube", s: 0.34 },
    { p: [1.5, 0.55, -0.4], type: "cube", s: 0.32 },
    { p: [-1.15, -0.15, 0.95], type: "octa", s: 0.3 },
    { p: [1.2, -0.1, 0.9], type: "octa", s: 0.3 },
    { p: [0, 1.2, -0.45], type: "octa", s: 0.24 },
    { p: [0, -0.7, 0.35], type: "octa", s: 0.26 },
    { p: [-2.05, 0.1, 0.1], type: "dot", s: 0.09 },
    { p: [2.05, 0.15, 0], type: "dot", s: 0.09 },
    { p: [-0.55, 0.12, 1.35], type: "dot", s: 0.08 },
    { p: [0.6, 0.08, 1.3], type: "dot", s: 0.08 },
  ];

  const positions = [];
  const animated = [];

  nodes.forEach((n, i) => {
    const pos = new THREE.Vector3(...n.p);
    positions.push(pos);

    let mesh;
    if (n.type === "cube") {
      const geo = new THREE.BoxGeometry(n.s, n.s, n.s);
      mesh = new THREE.Mesh(geo, fillMat.clone());
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    } else if (n.type === "octa") {
      const geo = new THREE.OctahedronGeometry(n.s, 0);
      mesh = new THREE.Mesh(geo, fillMat.clone());
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    } else {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(n.s, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xffc060 })
      );
    }
    mesh.position.copy(pos);
    mesh.userData = { type: n.type, phase: i * 0.6 };
    root.add(mesh);
    animated.push(mesh);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(n.s * 0.4, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xff8a30,
        transparent: true,
        opacity: 0.65,
      })
    );
    glow.position.copy(pos);
    root.add(glow);
    animated.push(glow);
  });

  const pairs = [
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

  pairs.forEach(([a, b]) => {
    const pa = positions[a];
    const pb = positions[b];
    const mid = new THREE.Vector3((pa.x + pb.x) / 2, pa.y, pa.z);
    const mid2 = new THREE.Vector3((pa.x + pb.x) / 2, pb.y, pb.z);
    root.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([pa, mid, mid2, pb]),
        lineMat
      )
    );
  });

  const packets = pairs.slice(0, 8).map(([a, b], i) => {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffd080 })
    );
    p.userData = { a, b, offset: i * 0.13 };
    root.add(p);
    return p;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.012 * scale;
    root.rotation.y = Math.sin(t * 0.25) * 0.12 + t * 0.07;
    animated.forEach((m) => {
      if (m.userData.type === "cube") {
        m.rotation.x = t * 0.25 + m.userData.phase;
        m.rotation.y = t * 0.3 + m.userData.phase;
      } else if (m.userData.type === "octa") {
        m.rotation.y = t * 0.45 + m.userData.phase;
      }
    });
    packets.forEach((p) => {
      const { a, b, offset } = p.userData;
      const u = (Math.sin(t * 1.3 + offset * Math.PI * 2) + 1) / 2;
      p.position.lerpVectors(positions[a], positions[b], u);
    });
    renderer.render(scene, camera);
  }
  animate();
});
