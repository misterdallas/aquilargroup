/**
 * Animated uplink / channel graph — Contact
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
  camera.position.set(0, 1.2, 4.6);
  camera.lookAt(0, 0.3, 0);
  camera.updateProjectionMatrix();

  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);

  const grid = makeGrid(6, 12);
  grid.position.y = -1;
  scene.add(grid);

  // Central relay
  const hub = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.45, 1),
    new THREE.MeshBasicMaterial({
      color: 0xff5a00,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    })
  );
  root.add(hub);
  root.add(
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.22, 0),
      new THREE.MeshBasicMaterial({ color: 0xffb050 })
    )
  );

  // Satellite nodes around hub
  const satellites = [];
  const packets = [];
  const links = [];
  const count = 8;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 1.55;
    const y = Math.sin(i * 1.3) * 0.45;

    const node = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshBasicMaterial({
        color: 0xff5a00,
        transparent: true,
        opacity: 0.25,
      })
    );
    node.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.14, 0)),
        new THREE.LineBasicMaterial({ color: 0xffa040 })
      )
    );
    node.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    node.userData = { angle, radius, y };
    root.add(node);
    satellites.push(node);

    const linkGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      node.position.clone(),
    ]);
    const link = new THREE.Line(
      linkGeo,
      new THREE.LineBasicMaterial({
        color: 0xff5a00,
        transparent: true,
        opacity: 0.45,
      })
    );
    root.add(link);
    links.push({ line: link, node });

    const packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe0a0 })
    );
    packet.userData = { node, offset: i / count };
    root.add(packet);
    packets.push(packet);
  }

  const rings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.9 + i * 0.25, 0.008, 6, 80),
      new THREE.MeshBasicMaterial({
        color: 0xff5a00,
        transparent: true,
        opacity: 0.35 - i * 0.08,
      })
    );
    ring.rotation.x = Math.PI / 2.2;
    root.add(ring);
    rings.push(ring);
  }

  const hubOrigin = new THREE.Vector3(0, 0, 0);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.012 * scale;
    hub.rotation.y = t * 0.4;
    hub.rotation.x = t * 0.15;
    root.rotation.y = t * 0.12;

    satellites.forEach((node) => {
      const a = node.userData.angle + t * 0.25;
      node.position.set(
        Math.cos(a) * node.userData.radius,
        node.userData.y,
        Math.sin(a) * node.userData.radius
      );
      node.rotation.y = t;
    });

    links.forEach(({ line, node }) => {
      line.geometry.setFromPoints([hubOrigin, node.position]);
    });

    packets.forEach((packet) => {
      const u =
        (Math.sin(t * 2 + packet.userData.offset * Math.PI * 2) + 1) / 2;
      packet.position.lerpVectors(hubOrigin, packet.userData.node.position, u);
    });

    rings.forEach((r, i) => {
      r.scale.setScalar(1 + Math.sin(t * 1.5 + i) * 0.04);
      r.material.opacity = 0.2 + (Math.sin(t * 2 + i) * 0.5 + 0.5) * 0.15;
    });
    renderer.render(scene, camera);
  }
  animate();
});
