import * as THREE from 'three';

function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Procedural oak/walnut planks — warm, low-contrast so the paper stays the hero. */
export function createWoodTexture(size = 2048, maxAnisotropy = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const rnd = seeded(91);
  const planks = 5;
  const ph = size / planks;

  for (let p = 0; p < planks; p++) {
    const y0 = p * ph;
    const hue = 23 + rnd() * 5;
    const sat = 24 + rnd() * 7;
    const lit = 27 + rnd() * 6;
    const g = ctx.createLinearGradient(0, y0, size, y0 + ph);
    g.addColorStop(0, `hsl(${hue} ${sat}% ${lit + 2}%)`);
    g.addColorStop(0.5, `hsl(${hue + 1} ${sat}% ${lit}%)`);
    g.addColorStop(1, `hsl(${hue - 1} ${sat - 2}% ${lit + 1.5}%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, y0, size, ph);

    // Long grain lines that run along the plank.
    for (let k = 0; k < 170; k++) {
      const y = y0 + rnd() * ph;
      const amp = 2 + rnd() * 9;
      const freq = 0.0015 + rnd() * 0.004;
      const phase = rnd() * Math.PI * 2;
      const dark = rnd() > 0.25;
      ctx.strokeStyle = dark ? `rgba(38, 20, 8, ${0.035 + rnd() * 0.08})` : `rgba(255, 220, 170, ${0.02 + rnd() * 0.04})`;
      ctx.lineWidth = 0.6 + rnd() * 2.6;
      ctx.beginPath();
      for (let x = -20; x <= size + 20; x += 18) {
        const yy = y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1 + phase * 2) * amp * 0.25;
        if (x === -20) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    // A couple of soft cathedral figures per plank.
    for (let k = 0; k < 2; k++) {
      const cx = rnd() * size;
      const cy = y0 + ph * (0.3 + rnd() * 0.4);
      for (let r = 0; r < 14; r++) {
        ctx.strokeStyle = `rgba(40, 22, 10, ${0.03 + rnd() * 0.03})`;
        ctx.lineWidth = 1 + rnd() * 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 60 + r * 26, 8 + r * 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Plank seam.
    ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
    ctx.fillRect(0, y0, size, 2);
    ctx.fillStyle = 'rgba(255, 225, 180, 0.08)';
    ctx.fillRect(0, y0 + 2, size, 1.5);
  }

  // Fine pore noise.
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 10;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/** Soft rounded-rectangle shadow used for ambient contact darkening. */
export function createContactTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.filter = 'blur(18px)';
  ctx.fillStyle = '#000';
  ctx.fillRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);
  ctx.filter = 'none';
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function createProps() {
  const group = new THREE.Group();

  // A charcoal pencil, lying below the paper.
  const pencil = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#2a2724', roughness: 0.45 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.78, 6), bodyMat);
  body.rotation.z = Math.PI / 2;
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0215, 0.0215, 0.035, 6),
    new THREE.MeshStandardMaterial({ color: '#7b2d35', roughness: 0.4 })
  );
  band.rotation.z = Math.PI / 2;
  band.position.x = -0.37;
  const wood = new THREE.Mesh(new THREE.ConeGeometry(0.021, 0.085, 6), new THREE.MeshStandardMaterial({ color: '#d6b588', roughness: 0.8 }));
  wood.rotation.z = -Math.PI / 2;
  wood.position.x = 0.4325;
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.024, 6), new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.3 }));
  lead.rotation.z = -Math.PI / 2;
  lead.position.x = 0.4635;
  pencil.add(body, band, wood, lead);
  pencil.traverse((o) => (o.castShadow = o.receiveShadow = true));
  pencil.position.set(-0.4, 0.021, 1.24);
  pencil.rotation.y = 0.32;
  group.add(pencil);

  // An espresso cup on a saucer, top right.
  const ceramic = new THREE.MeshStandardMaterial({ color: '#ece6da', roughness: 0.32 });
  const cup = new THREE.Group();
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.235, 0.022, 64), ceramic);
  saucer.position.y = 0.012;
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.2, 64, 1, true), ceramic);
  wall.material = ceramic.clone();
  wall.material.side = THREE.DoubleSide;
  wall.position.y = 0.124;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.01, 48), ceramic);
  base.position.y = 0.029;
  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.152, 48),
    new THREE.MeshStandardMaterial({ color: '#2b170c', roughness: 0.15 })
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.205;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 12, 32, Math.PI * 1.15), ceramic);
  handle.position.set(0.17, 0.13, 0);
  handle.rotation.z = -Math.PI * 0.57;
  cup.add(saucer, wall, base, coffee, handle);
  cup.traverse((o) => (o.castShadow = o.receiveShadow = true));
  cup.position.set(1.98, 0, -0.78);
  cup.rotation.y = -0.6;
  group.add(cup);

  return group;
}
