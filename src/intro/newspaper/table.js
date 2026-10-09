import * as THREE from 'three';
import { DESK } from './config.js';
export { loadImage } from '../../lib/images.js';
import { createProps } from './props.js';

/*
 * The desk the newspaper rests on. Two interchangeable versions:
 *   photo       — a photographed desk (e.g. from Higgsfield) projected onto the
 *                 desk plane from the opening camera. Cup and pencil are part of
 *                 the photograph.
 *   procedural  — the stand-in: a walnut texture lit by a window-shaped gobo,
 *                 with a modelled cup and pencil.
 * Both expose `uniforms.uFade` / `uBlur` so the desk can recede as the page
 * fills the screen.
 */

function imageTexture(img, { srgb = true, repeat = false, anisotropy = 1 } = {}) {
  const tex = new THREE.Texture(img);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = anisotropy;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function createDeskUniforms() {
  return { uFade: { value: 0 }, uBlur: { value: 0 } };
}

/* ── Photo desk ───────────────────────────────────────────────────────── */

export function createPhotoDesk(photo, uniforms, maxAnisotropy) {
  const tex = imageTexture(photo, { anisotropy: maxAnisotropy });
  const material = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uPhoto: { value: tex }, uProjector: { value: new THREE.Matrix4() } },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uPhoto;
      uniform mat4 uProjector;
      uniform float uFade;
      uniform float uBlur;
      varying vec3 vWorld;
      void main() {
        vec4 pc = uProjector * vec4(vWorld, 1.0);
        vec2 uv = pc.xy / pc.w * 0.5 + 0.5;
        // Beyond the photograph's frame, dissolve into a soft, darkened version
        // of its edge (no repeats, so props are never duplicated).
        vec2 cuv = clamp(uv, 0.0, 1.0);
        float outside = length(max(abs(uv - 0.5) - 0.5, 0.0));
        vec3 c = texture2D(uPhoto, cuv, uBlur).rgb;
        vec3 edge = texture2D(uPhoto, cuv, 10.0).rgb * 0.6;
        c = mix(c, edge, smoothstep(0.0, 0.008, outside));
        c *= 1.0 - 0.45 * uFade;
        gl_FragColor = linearToOutputTexel(vec4(c, 1.0));
      }`,
  });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), material);
  desk.rotation.x = -Math.PI / 2;

  // Shadows from the live paper are laid over the photograph.
  const catcher = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ color: '#190d05', opacity: 0.6, depthWrite: false })
  );
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = 0.0004;
  catcher.receiveShadow = true;

  const group = new THREE.Group();
  group.add(desk, catcher);
  return { group, projectorUniform: material.uniforms.uProjector, aspect: photo.naturalWidth / photo.naturalHeight };
}

/**
 * Low-frequency daylight pattern of the photograph (window light, shadows,
 * falloff) with the wood grain blurred away, normalised around 1 and stored
 * as value / 2. Paper samples it so it is lit like the desk beneath it.
 */
export function createLightMap(photo) {
  const w = 96;
  const h = Math.max(2, Math.round((w * photo.naturalHeight) / photo.naturalWidth));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if ('filter' in ctx) ctx.filter = 'blur(1.6px)';
  ctx.drawImage(photo, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = new Float32Array(w * h);
  let sum = 0;
  for (let i = 0; i < w * h; i++) {
    lum[i] = 0.2126 * lin(px[i * 4]) + 0.7152 * lin(px[i * 4 + 1]) + 0.0722 * lin(px[i * 4 + 2]);
    sum += lum[i];
  }
  // Normalise against the brighter half so sunlit desk ≈ 1.
  const sorted = Array.from(lum).sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.75)] || sum / lum.length || 1;
  const data = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const f = Math.min(1.6, Math.max(0.35, lum[i] / ref));
    // DataTexture rows run bottom-up; flip so it matches the photo's UVs.
    const y = Math.floor(i / w);
    const o = ((h - 1 - y) * w + (i % w)) * 4;
    data[o] = data[o + 1] = data[o + 2] = Math.round((f / 2) * 255);
    data[o + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, w, h);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/* ── Procedural walnut desk ───────────────────────────────────────────── */

export function createProceduralDesk({ wood, detail }, uniforms, maxAnisotropy, { compact = false } = {}) {
  const cfg = DESK.procedural;
  const map = imageTexture(wood, { anisotropy: maxAnisotropy });
  // The desk extends past the texture with mirrored tiles, so tall phone
  // views never see its edge. One tile = the configured size.
  const TILES = 3;
  map.wrapS = map.wrapT = THREE.MirroredRepeatWrapping;
  map.repeat.set(TILES, TILES);
  map.offset.set(-(TILES - 1) / 2, -(TILES - 1) / 2);
  const detailMap = detail ? imageTexture(detail, { srgb: false, repeat: true, anisotropy: maxAnisotropy }) : null;
  // Satin oil finish: a soft clearcoat sheen over wood whose pores are rougher.
  const material = new THREE.MeshPhysicalMaterial({
    map,
    roughness: detailMap ? 1.5 : 0.75, // × pore map (mean ≈ 0.5) → satin ≈ 0.75, pores rougher
    roughnessMap: detailMap,
    metalness: 0,
    specularIntensity: 0.32, // oiled wood: a soft sheen, never a lacquer glare
    clearcoat: 0.05,
    clearcoatRoughness: 0.65,
    envMapIntensity: 0.25,
  });
  const repeat = new THREE.Vector2(cfg.size[0] / 0.62, cfg.size[1] / 0.62);
  if (detailMap) detailMap.repeat.copy(repeat).multiplyScalar(TILES); // pore roughness tiles with the pore detail
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, { uDetail: { value: detailMap }, uDetailRepeat: { value: repeat } });
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uDetail;
        uniform vec2 uDetailRepeat;
        uniform float uFade;
        uniform float uBlur;`
      )
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D(map, vMapUv, uBlur);
          ${detailMap ? 'sampledDiffuseColor.rgb *= 0.55 + 0.9 * texture2D(uDetail, vMapUv * uDetailRepeat, uBlur).r;' : ''}
          diffuseColor *= sampledDiffuseColor;
        #endif`
      )
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb *= 1.0 - 0.45 * uFade;');
  };
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(cfg.size[0] * TILES, cfg.size[1] * TILES), material);
  desk.rotation.x = -Math.PI / 2;
  desk.position.set(cfg.centre[0], 0, cfg.centre[1]);
  desk.receiveShadow = true;

  const group = new THREE.Group();
  group.add(desk, createProps({ compact }));
  return { group };
}

/**
 * A soft, slightly rotated window: panes of light divided by glazing bars.
 * Values are linear light factors (outside the window the desk still gets
 * bounce light), so the texture is stored without colour-space conversion.
 */
export function createWindowGobo() {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  const shade = (v) => `rgb(${v},${v},${v})`;
  ctx.fillStyle = shade(52); // wall bounce outside the window
  ctx.fillRect(0, 0, S, S);
  if ('filter' in ctx) ctx.filter = 'blur(1.5px)';
  ctx.save();
  ctx.translate(S / 2, S / 2);
  ctx.rotate(-0.14);
  ctx.translate(-S / 2, -S / 2);
  ctx.fillStyle = shade(255);
  ctx.fillRect(S * 0.02, S * 0.02, S * 0.96, S * 0.96);
  // A multi-pane window: thin muntins every quarter, a heavier middle rail.
  ctx.fillStyle = shade(70);
  for (let i = 1; i < 4; i++) {
    const w = i === 2 ? 0.03 : 0.018;
    ctx.fillRect(S * (i / 4 - w / 2), -S, S * w, S * 3);
    ctx.fillRect(-S, S * (i / 4 - w / 2), S * 3, S * w);
  }
  ctx.restore();
  // A plant on the sill: soft leaf shadows in one corner of the light.
  ctx.fillStyle = ctx.strokeStyle = shade(84);
  if ('filter' in ctx) ctx.filter = 'blur(3px)';
  let seed = 19;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let b = 0; b < 3; b++) {
    const x0 = S * (0.0 + b * 0.05);
    const y0 = S * (1.02 - b * 0.03);
    const x1 = S * (0.16 + b * 0.09 + rnd() * 0.05);
    const y1 = S * (0.6 + rnd() * 0.12);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2 - S * 0.04, (y0 + y1) / 2, x1, y1);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const t = 0.25 + i * 0.13;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      const len = S * (0.045 + rnd() * 0.05);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i % 2 ? -1 : 1) * (0.7 + rnd() * 0.6) - 0.4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.5, -len * 0.3, len, 0);
      ctx.quadraticCurveTo(len * 0.5, len * 0.3, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.filter = 'none';
  const g = ctx.createRadialGradient(S * 0.5, S * 0.45, S * 0.2, S * 0.5, S * 0.5, S * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/** Soft rounded-rectangle shadow used for ambient contact darkening. */
export function createContactTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  // Layered fills approximate a blur everywhere (no reliance on ctx.filter).
  for (let i = 0; i < 18; i++) {
    const inset = size * (0.2 - i * 0.008);
    ctx.fillStyle = `rgba(0,0,0,${0.06})`;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(inset, inset, size - inset * 2, size - inset * 2, size * 0.06 + i * 2);
    else ctx.rect(inset, inset, size - inset * 2, size - inset * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}
