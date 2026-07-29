/**
 * Animated network globe — Home
 */
import {
  THREE,
  createRenderer,
  motionScale,
  bootViz,
} from "./three-setup.js?v=20260729b";

bootViz(() => {
  const canvas = document.getElementById("viz-canvas");
  if (!canvas) return;

  const scale = motionScale();
  const { renderer, camera } = createRenderer(canvas);
  camera.position.set(0, 0.2, 3.35);

  const scene = new THREE.Scene();
  const root = new THREE.Group();
  root.rotation.x = 0.32;
  scene.add(root);

  // Soft outer glow sphere
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 32, 24),
    new THREE.MeshBasicMaterial({
      color: 0xff5a00,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    })
  );
  scene.add(glow);

  // Wireframe globe
  const sphereGeo = new THREE.SphereGeometry(1, 36, 28);
  root.add(
    new THREE.LineSegments(
      new THREE.WireframeGeometry(sphereGeo),
      new THREE.LineBasicMaterial({
        color: 0xff5a00,
        transparent: true,
        opacity: 0.32,
      })
    )
  );

  // Dark core
  root.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.98, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x0e0a06,
        transparent: true,
        opacity: 0.92,
      })
    )
  );

  // Latitude rings
  const ringMat = new THREE.LineBasicMaterial({
    color: 0xff6a10,
    transparent: true,
    opacity: 0.35,
  });
  [-0.55, -0.2, 0.15, 0.5].forEach((y) => {
    const r = Math.sqrt(Math.max(0.05, 1 - y * y)) * 0.99;
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    root.add(
      new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMat)
    );
  });

  function latLonToVec(lat, lon, radius) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  const nodes = [
    [38.9, -77],
    [33.7, -84.4],
    [32.9, -97],
    [34, -118.2],
    [47.6, -122.3],
    [51.5, -0.1],
    [48.8, 2.3],
    [52.5, 13.4],
    [25.2, 55.3],
    [1.3, 103.8],
    [35.7, 139.7],
    [-33.9, 151.2],
    [28.6, 77.2],
    [-23.5, -46.6],
    [19.4, -99.1],
    [37.5, 127],
    [41, 28.9],
    [55.7, 37.6],
  ];

  const positions = nodes.map(([lat, lon]) => latLonToVec(lat, lon, 1.02));
  const nodeMeshes = [];
  const nodeGeo = new THREE.SphereGeometry(0.03, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffc060 });

  positions.forEach((pos, i) => {
    const n = new THREE.Mesh(nodeGeo, nodeMat);
    n.position.copy(pos);
    n.userData.i = i;
    root.add(n);
    nodeMeshes.push(n);

    const g = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xff5a00,
        transparent: true,
        opacity: 0.35,
      })
    );
    g.position.copy(pos);
    root.add(g);
    nodeMeshes.push(g);
  });

  const links = [
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
    [10, 15],
    [7, 16],
    [4, 10],
    [0, 7],
    [16, 17],
  ];

  const linkMat = new THREE.LineBasicMaterial({
    color: 0xff5a00,
    transparent: true,
    opacity: 0.5,
  });

  links.forEach(([a, b]) => {
    root.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([positions[a], positions[b]]),
        linkMat
      )
    );
  });

  // Orbit ring
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.38, 0.006, 8, 128),
    new THREE.MeshBasicMaterial({
      color: 0xff5a00,
      transparent: true,
      opacity: 0.45,
    })
  );
  orbit.rotation.x = Math.PI / 2.35;
  scene.add(orbit);

  // Scan arc
  const scan = new THREE.Mesh(
    new THREE.TorusGeometry(1.08, 0.012, 6, 48, Math.PI * 0.35),
    new THREE.MeshBasicMaterial({ color: 0xffa040 })
  );
  root.add(scan);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.012 * scale;
    // Always animate so Chrome/mobile aren't stuck static
    root.rotation.y += 0.004 * scale;
    orbit.rotation.z += 0.003 * scale;
    scan.rotation.y = t * 1.2;
    nodeMeshes.forEach((m, i) => {
      const pulse = 1 + Math.sin(t * 2.5 + i * 0.35) * 0.18 * scale;
      m.scale.setScalar(pulse);
    });
    renderer.render(scene, camera);
  }
  animate();
});
