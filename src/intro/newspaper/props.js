import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/*
 * Still-life props for the procedural desk. Scale: 1 scene unit ≈ 20 cm.
 * Everything sits outside the newspaper's unfolding footprint
 * (|x| < 1.5, |z| < 1) so the paper never passes through it.
 */

const lathe = (points, segments = 72) => new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);

function canvasTexture(size, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function seeded(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const shadowed = (obj, receive = true) => {
  obj.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = receive;
    }
  });
  return obj;
};

/* ── Espresso cup, saucer and teaspoon ───────────────────────────────── */

function crema() {
  return canvasTexture(256, (ctx, S) => {
    const g = ctx.createRadialGradient(S * 0.46, S * 0.47, S * 0.02, S / 2, S / 2, S / 2);
    g.addColorStop(0, '#2a1508');
    g.addColorStop(0.5, '#43250f');
    g.addColorStop(0.83, '#6a4220');
    g.addColorStop(0.94, '#341c0b');
    g.addColorStop(1, '#140a04');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    // Tiger-striped crema and a few fine bubbles.
    const rnd = seeded(41);
    for (let i = 0; i < 260; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * S * 0.44;
      ctx.fillStyle = rnd() > 0.5 ? `rgba(196,140,82,${0.08 + rnd() * 0.12})` : `rgba(60,30,12,${0.06 + rnd() * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r, 1 + rnd() * 5, 0.6 + rnd() * 1.6, a + 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function createEspresso() {
  const glaze = new THREE.MeshPhysicalMaterial({ color: '#f0eadf', roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.12 });
  const bisque = new THREE.MeshStandardMaterial({ color: '#d8cfbf', roughness: 0.85 }); // unglazed foot ring
  const group = new THREE.Group();

  // Saucer: foot ring, gentle well, raised rim.
  const saucer = new THREE.Mesh(
    lathe([
      [0, 0.0005], [0.14, 0.0005], [0.152, 0.004], [0.165, 0.009], [0.22, 0.014], [0.262, 0.024], [0.29, 0.034],
      [0.299, 0.04], [0.296, 0.045], [0.284, 0.042], [0.25, 0.032], [0.19, 0.024], [0.125, 0.0205], [0.118, 0.018], [0.11, 0.02], [0, 0.02],
    ]),
    glaze
  );
  const foot = new THREE.Mesh(new THREE.RingGeometry(0.135, 0.155, 72), bisque);
  foot.rotation.x = -Math.PI / 2;
  foot.position.y = 0.0009;
  group.add(saucer, foot);

  // Cup: rounded belly, thin lip, curved interior.
  const cup = new THREE.Group();
  cup.position.y = 0.02;
  cup.add(
    new THREE.Mesh(
      lathe([
        [0, 0], [0.084, 0], [0.091, 0.006], [0.094, 0.014], [0.107, 0.024], [0.129, 0.042], [0.148, 0.072], [0.16, 0.112],
        [0.166, 0.152], [0.169, 0.186], [0.17, 0.2], [0.166, 0.204], [0.16, 0.2], [0.158, 0.186], [0.153, 0.142], [0.142, 0.097],
        [0.124, 0.062], [0.095, 0.042], [0.05, 0.033], [0, 0.031],
      ]),
      glaze
    )
  );
  const handlePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.158, 0.165, 0),
    new THREE.Vector3(0.212, 0.168, 0),
    new THREE.Vector3(0.243, 0.135, 0),
    new THREE.Vector3(0.232, 0.092, 0),
    new THREE.Vector3(0.188, 0.07, 0),
    new THREE.Vector3(0.15, 0.078, 0),
  ]);
  cup.add(new THREE.Mesh(new THREE.TubeGeometry(handlePath, 40, 0.0115, 12, false), glaze));
  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.152, 64),
    new THREE.MeshPhysicalMaterial({ map: crema(), roughness: 0.2, specularIntensity: 0.4, clearcoat: 0.2, clearcoatRoughness: 0.1, envMapIntensity: 0.12 })
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.168;
  cup.add(coffee);
  group.add(cup);

  // Teaspoon resting on the saucer.
  const steel = new THREE.MeshStandardMaterial({ color: '#cfc8bb', metalness: 1, roughness: 0.22 });
  const spoon = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), steel);
  bowl.scale.set(0.024, 0.008, 0.036);
  bowl.position.y = 0.008;
  const outline = new THREE.Shape();
  outline.moveTo(-0.0045, 0);
  outline.lineTo(-0.0085, 0.13);
  outline.quadraticCurveTo(0, 0.152, 0.0085, 0.13);
  outline.lineTo(0.0045, 0);
  outline.lineTo(-0.0045, 0);
  const handle = new THREE.Mesh(new THREE.ExtrudeGeometry(outline, { depth: 0.003, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0008, bevelSegments: 2 }), steel);
  handle.rotation.x = -Math.PI / 2 - 0.08;
  handle.position.set(0, 0.009, -0.03);
  spoon.add(bowl, handle);
  spoon.position.set(0.05, 0.026, 0.215);
  spoon.rotation.y = 1.25;
  group.add(spoon);

  return shadowed(group);
}

/* ── Reading glasses ─────────────────────────────────────────────────── */

export function createGlasses() {
  const wire = new THREE.MeshStandardMaterial({ color: '#a9844e', metalness: 1, roughness: 0.3 });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.03,
    metalness: 0,
    transparent: true,
    opacity: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    depthWrite: false,
  });
  // Built facing the viewer (lenses in the XY plane), then laid on the desk.
  const front = new THREE.Group();
  const R = 0.066;
  for (const side of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.0042, 10, 72), wire);
    rim.position.x = side * 0.082;
    const lens = new THREE.Mesh(new THREE.CircleGeometry(R, 48), lensMat);
    lens.position.x = side * 0.082;
    lens.castShadow = false;
    front.add(rim, lens);
    // Hinge and folded temple running behind the lenses.
    const hinge = new THREE.Vector3(side * 0.152, 0.018, -0.004);
    const temple = new THREE.CatmullRomCurve3([
      hinge,
      new THREE.Vector3(side * 0.148, 0.02, -0.016),
      new THREE.Vector3(side * 0.02, 0.026 - side * 0.004, -0.02),
      new THREE.Vector3(-side * 0.105, 0.03 - side * 0.006, -0.022),
      new THREE.Vector3(-side * 0.128, 0.004, -0.024),
    ]);
    front.add(new THREE.Mesh(new THREE.TubeGeometry(temple, 48, 0.0028, 8, false), wire));
  }
  const bridge = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.017, 0.012, 0),
    new THREE.Vector3(0, 0.024, -0.004),
    new THREE.Vector3(0.017, 0.012, 0),
  ]);
  front.add(new THREE.Mesh(new THREE.TubeGeometry(bridge, 16, 0.0034, 8, false), wire));
  for (const side of [-1, 1]) {
    // Nose pads.
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 12, 8), new THREE.MeshPhysicalMaterial({ color: '#efe6d6', roughness: 0.2, transparent: true, opacity: 0.7 }));
    pad.scale.set(0.6, 1, 0.4);
    pad.position.set(side * 0.026, -0.012, -0.012);
    front.add(pad);
  }
  shadowed(front);
  front.children.forEach((c) => {
    if (c.material === lensMat) c.castShadow = false;
  });
  // Lying lenses-up, propped slightly on the folded temples.
  const glasses = new THREE.Group();
  front.rotation.x = -Math.PI / 2 + 0.16;
  front.position.y = 0.024;
  glasses.add(front);
  return glasses;
}

/* ── Notebook and pencil ─────────────────────────────────────────────── */

function linen() {
  return canvasTexture(512, (ctx, S) => {
    ctx.fillStyle = '#2c2b29';
    ctx.fillRect(0, 0, S, S);
    const rnd = seeded(7);
    for (let i = 0; i < S; i += 2) {
      ctx.fillStyle = `rgba(255,255,255,${0.02 + rnd() * 0.035})`;
      ctx.fillRect(0, i, S, 1);
      ctx.fillStyle = `rgba(0,0,0,${0.04 + rnd() * 0.05})`;
      ctx.fillRect(i, 0, 1, S);
    }
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 3, 1);
    }
  });
}

function pageEdges() {
  return canvasTexture(256, (ctx, S) => {
    ctx.fillStyle = '#ece4d4';
    ctx.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 3) {
      ctx.fillStyle = `rgba(120,100,70,${0.08 + (y % 9 === 0 ? 0.06 : 0)})`;
      ctx.fillRect(0, y, S, 1);
    }
  });
}

export function createPencil() {
  const pencil = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: '#2a2a27', roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.62, 6), paint);
  body.rotation.z = Math.PI / 2;
  const ferrule = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0225, 0.0225, 0.045, 18),
    new THREE.MeshStandardMaterial({ color: '#b7a77f', metalness: 1, roughness: 0.32 })
  );
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.x = -0.332;
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.0205, 0.03, 18), new THREE.MeshStandardMaterial({ color: '#b98d80', roughness: 0.9 }));
  eraser.rotation.z = Math.PI / 2;
  eraser.position.x = -0.369;
  const wood = new THREE.Mesh(new THREE.ConeGeometry(0.021, 0.085, 6), new THREE.MeshStandardMaterial({ color: '#d2b183', roughness: 0.85 }));
  wood.rotation.z = -Math.PI / 2;
  wood.position.x = 0.3525;
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.0062, 0.024, 6), new THREE.MeshStandardMaterial({ color: '#2b2b2b', metalness: 0.4, roughness: 0.28 }));
  lead.rotation.z = -Math.PI / 2;
  lead.position.x = 0.3835;
  pencil.add(body, ferrule, eraser, wood, lead);
  return shadowed(pencil);
}

export function createNotebook() {
  const book = new THREE.Group();
  const W = 0.74;
  const D = 1.04;
  const cover = new THREE.MeshStandardMaterial({ map: linen(), roughness: 0.82 });
  const top = new THREE.Mesh(new RoundedBoxGeometry(W, 0.008, D, 2, 0.004), cover);
  top.position.y = 0.032;
  const bottom = new THREE.Mesh(new RoundedBoxGeometry(W, 0.008, D, 2, 0.004), cover);
  bottom.position.y = 0.004;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(W - 0.018, 0.022, D - 0.016), new THREE.MeshStandardMaterial({ map: pageEdges(), roughness: 0.9 }));
  pages.position.set(0.006, 0.018, 0);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.04, D + 0.006), new THREE.MeshStandardMaterial({ color: '#191817', roughness: 0.6 }));
  band.position.set(W / 2 - 0.09, 0.019, 0);
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.0015, 0.2), new THREE.MeshStandardMaterial({ color: '#6b2a2f', roughness: 0.55 }));
  ribbon.position.set(-0.12, 0.0025, D / 2 + 0.07);
  ribbon.rotation.y = 0.12;
  book.add(top, bottom, pages, band, ribbon);
  shadowed(book);
  const pencil = createPencil();
  pencil.position.set(0.04, 0.036 + 0.021, -0.06);
  pencil.rotation.y = 0.62;
  book.add(pencil);
  return book;
}

/**
 * All props, placed outside the unfolding footprint. Phones frame the paper
 * tall and narrow, so the still life is rearranged above and below it.
 */
const LAYOUT = {
  wide: {
    espresso: [2.06, -0.42, -2.5],
    glasses: [2.05, 0.98, 0.42],
    notebook: [-0.86, 1.78, 0.24],
  },
  compact: {
    espresso: [1.3, -1.52, -2.3],
    glasses: [0.15, -1.42, 2.75],
    notebook: [0.95, 1.95, -0.12],
  },
};

export function createProps({ compact = false } = {}) {
  const at = LAYOUT[compact ? 'compact' : 'wide'];
  const group = new THREE.Group();
  const place = (obj, [x, z, rot]) => {
    obj.position.set(x, 0, z);
    obj.rotation.y = rot;
    group.add(obj);
  };
  place(createEspresso(), at.espresso);
  place(createGlasses(), at.glasses);
  place(createNotebook(), at.notebook);
  return group;
}
