// One paper-grain tile shared by the CSS page background and the 3D paper
// textures, so the printed sheet and the live page have the same surface.

let tile = null;

export function grainTile() {
  if (tile) return tile;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  let seed = 1337;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rnd();
    const dark = v > 0.5;
    img.data[i] = dark ? 70 : 255;
    img.data[i + 1] = dark ? 56 : 250;
    img.data[i + 2] = dark ? 40 : 238;
    img.data[i + 3] = Math.round(Math.pow(Math.abs(v - 0.5) * 2, 2.4) * (dark ? 26 : 30));
  }
  ctx.putImageData(img, 0, 0);
  // A few faint fibres.
  ctx.lineCap = 'round';
  for (let k = 0; k < 26; k++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const a = rnd() * Math.PI * 2;
    const l = 6 + rnd() * 16;
    ctx.strokeStyle = `rgba(90, 70, 45, ${0.05 + rnd() * 0.06})`;
    ctx.lineWidth = 0.5 + rnd() * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  tile = canvas;
  return tile;
}

export function installGrain() {
  try {
    document.documentElement.style.setProperty('--grain', `url(${grainTile().toDataURL('image/png')})`);
  } catch {
    /* non-essential */
  }
}
