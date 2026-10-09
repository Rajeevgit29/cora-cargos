import * as THREE from 'three';
import { SHEET } from './config.js';

/*
 * A single printed sheet, deformed on the CPU each frame.
 *
 * Rest state: the open spread lying flat in the XZ plane, inside face up (+Y),
 * top edge of the page at -Z. Two creases fold it:
 *   fold A (the spine) — crease along x = 0, the left half (x < 0) swings over the right
 *   fold B (half fold) — crease along z = 0, the top half (z < 0) swings over the bottom
 * Folding applies A, then B, so a folded sheet is the bottom-right quarter with
 * the outside of the top-right quarter on top.
 *
 * Each fold bends the flap along a curve described by its tangent angle α(s),
 * where s is arc length from the crease. Near the crease the sheet wraps around
 * a small radius (so stacked layers never intersect); beyond it the flap gets a
 * gentle curl and gravity droop, so it reads as paper rather than board. Points
 * that sit above the base plane (already-folded layers) are carried along the
 * curve's normal, which is what makes multi-layer folding work.
 */

const CURL_SAMPLES = 7; // the curl strength varies along the crease; we interpolate between these

function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise1(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

/** Fills `out` with (u, y, nu, ny) for arc lengths k * step, k = 0..n. */
function bendCurve(out, n, step, theta, radius, length, curl, twistFactor) {
  if (theta < 1e-5) {
    for (let k = 0; k <= n; k++) {
      out[k * 4] = k * step;
      out[k * 4 + 1] = 0;
      out[k * 4 + 2] = 0;
      out[k * 4 + 3] = 1;
    }
    return;
  }
  const ell = Math.PI * radius;
  const rho = ell / theta;
  const cosT = Math.cos(theta);
  const amp = Math.sin(theta) * twistFactor * (curl.trail - curl.droop * cosT);
  const span = Math.max(1e-6, length - ell);
  const alphaAt = (s) => (s <= ell ? (theta * s) / ell : theta + amp * Math.pow((s - ell) / span, 1.6));

  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  let s = ell;
  let su = rho * Math.sin(theta);
  let sy = rho * (1 - cosT);
  for (let k = 1; k <= n; k++) {
    const target = k * step;
    let u, y, alpha;
    if (target <= ell) {
      alpha = (theta * target) / ell;
      u = rho * Math.sin(alpha);
      y = rho * (1 - Math.cos(alpha));
    } else {
      while (s < target - 1e-9) {
        const h = Math.min(step, target - s);
        const am = alphaAt(s + h / 2);
        su += Math.cos(am) * h;
        sy += Math.sin(am) * h;
        s += h;
      }
      u = su;
      y = sy;
      alpha = alphaAt(target);
    }
    out[k * 4] = u;
    out[k * 4 + 1] = y;
    out[k * 4 + 2] = -Math.sin(alpha);
    out[k * 4 + 3] = Math.cos(alpha);
  }
}

export class PaperGeometry {
  constructor([nx, nz], layerCount = SHEET.layers) {
    if (nx % 2 || nz % 2) throw new Error('Paper segments must be even so creases fall on vertices.');
    const W = SHEET.width;
    const H = SHEET.height;
    const cols = nx + 1;
    const rows = nz + 1;
    const count = cols * rows;
    Object.assign(this, { nx, nz, cols, rows, count, W, H, dx: W / nx, dz: H / nz });

    // Shared topology: every sheet uses the same UVs and triangles.
    const uvs = new Float32Array(count * 2);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        uvs[k * 2] = i / nx;
        uvs[k * 2 + 1] = 1 - j / nz;
      }
    }
    const index = new (count > 65535 ? Uint32Array : Uint16Array)(nx * nz * 6);
    let o = 0;
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const a = j * cols + i;
        const b = a + 1;
        const c = a + cols;
        const d = c + 1;
        index[o++] = a;
        index[o++] = c;
        index[o++] = b;
        index[o++] = b;
        index[o++] = c;
        index[o++] = d;
      }
    }
    const uvAttr = new THREE.BufferAttribute(uvs, 2);
    const indexAttr = new THREE.BufferAttribute(index, 1);

    /*
     * Layers, outermost first. In the open state they lie stacked with the
     * innermost sheet on top (it carries the printed spread); each sits one
     * sheet-thickness above the previous. Only the free edges differ between
     * sheets — creases must coincide or the stack would tear.
     */
    const J = SHEET.edgeJitter;
    this.layers = Array.from({ length: layerCount }, (_, layer) => {
      const restX = new Float32Array(count);
      const restZ = new Float32Array(count);
      const seed = layer * 7.31;
      const inner = layer === layerCount - 1;
      const reach = inner ? 0 : (layer % 2 ? -0.6 : 0.8) * J; // outer sheets peek out a little
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          let x = -W / 2 + (i / nx) * W;
          let z = -H / 2 + (j / nz) * H;
          if (i === 0) x += J * noise1(j * 0.37 + 3.1 + seed) - reach;
          if (i === nx) x -= J * noise1(j * 0.41 + 9.7 + seed) - reach;
          if (j === 0) z += J * noise1(i * 0.29 + 1.3 + seed) - reach;
          if (j === nz) z -= J * noise1(i * 0.33 + 5.9 + seed) - reach;
          if ((i === 0 || i === nx) && (j === 0 || j === nz)) {
            x += (i === 0 ? 1 : -1) * J * 0.9;
            z += (j === 0 ? 1 : -1) * J * 0.9;
          }
          restX[k] = x;
          restZ[k] = z;
        }
      }
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
      geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage));
      geometry.setAttribute('uv', uvAttr);
      geometry.setIndex(indexAttr);
      return { restX, restZ, geometry, base: layer * SHEET.layerGap };
    });
    this.topHeight = (layerCount - 1) * SHEET.layerGap;

    // Pre-allocated curve buffers: one per curl sample, for each fold.
    this.curvesA = Array.from({ length: CURL_SAMPLES }, () => new Float32Array((nx / 2 + 1) * 4));
    this.curvesB = Array.from({ length: CURL_SAMPLES }, () => new Float32Array((nz / 2 + 1) * 4));
    this.bounds = { minX: 0, maxX: 0, minZ: 0, maxZ: 0, minY: 0 };
  }

  update(state) {
    const { nx, nz, dx } = this;
    const { thetaA, thetaB, curl } = state;
    const twist = curl.twist;
    for (let s = 0; s < CURL_SAMPLES; s++) {
      const tf = 1 + (twist * s) / (CURL_SAMPLES - 1);
      bendCurve(this.curvesA[s], nx / 2, dx, thetaA, SHEET.creaseRadiusA, this.W / 2, curl, tf);
      bendCurve(this.curvesB[s], nz / 2, this.dz, thetaB, SHEET.creaseRadiusB, this.H / 2, curl, tf);
    }
    this.layers.forEach((layer, i) => this.#deform(layer, state, i === 0));

    // Sheets are parallel offset surfaces: compute normals once, share them.
    const lead = this.layers[0].geometry;
    lead.computeVertexNormals();
    const n = lead.attributes.normal.array;
    for (let i = 1; i < this.layers.length; i++) {
      const attr = this.layers[i].geometry.attributes.normal;
      attr.array.set(n);
      attr.needsUpdate = true;
    }
    return this.bounds;
  }

  #deform(layer, state, trackBounds) {
    const { nx, nz, cols, rows, W, H, dx, dz } = this;
    const { sag, wobble } = state;
    const iA = nx / 2; // crease column
    const jB = nz / 2; // crease row
    const base = layer.base;
    const pos = layer.geometry.attributes.position.array;
    const b = this.bounds;
    if (trackBounds) {
      b.minX = b.minZ = b.minY = Infinity;
      b.maxX = b.maxZ = -Infinity;
    }
    const out = [0, 0, 0, 0];
    const sampleCurve = (curves, k, t) => {
      const f = t * (CURL_SAMPLES - 1);
      const s0 = Math.min(CURL_SAMPLES - 2, Math.floor(f));
      const w = f - s0;
      const c0 = curves[s0];
      const c1 = curves[s0 + 1];
      const q = k * 4;
      out[0] = c0[q] + (c1[q] - c0[q]) * w;
      out[1] = c0[q + 1] + (c1[q + 1] - c0[q + 1]) * w;
      out[2] = c0[q + 2] + (c1[q + 2] - c0[q + 2]) * w;
      out[3] = c0[q + 3] + (c1[q + 3] - c0[q + 3]) * w;
      return out;
    };

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const rx = layer.restX[k];
        const rz = layer.restZ[k];
        let x = rx;
        let y = base;
        let z = rz;

        // Fold A — the spine. The flap is x < 0; distance from crease is -x.
        // Points are carried along the curve's normal by their height in the
        // stack, so inner sheets wrap inside outer ones.
        if (i < iA) {
          const tz = rz / (H / 2);
          const c = sampleCurve(this.curvesA, iA - i, tz * tz);
          const extra = -rx - (iA - i) * dx; // edge jitter, carried along the tangent
          // tangent = (cos α, sin α) = (n.y, -n.x)
          x = -(c[0] + extra * c[3] + base * c[2]);
          y = c[1] - extra * c[2] + base * c[3];
        }

        // Fold B — the half fold, applied to the result of fold A. Flap is z < 0.
        if (j < jB) {
          const tx = x / (W / 2);
          const c = sampleCurve(this.curvesB, jB - j, Math.min(1, tx * tx));
          const extra = -rz - (jB - j) * dz;
          const h = y; // height above the base plane, carried along the normal
          const u = c[0] + extra * c[3] + h * c[2];
          y = c[1] + extra * -c[2] + h * c[3];
          z = -u;
        }

        // Gentle bow while the open sheet is held, plus low-frequency unevenness.
        const ex = x / (W / 2);
        y -= sag * ex * ex;
        y += wobble * 0.006 * Math.sin(1.9 * x + 0.7) * Math.sin(2.6 * z + 1.9);
        y += SHEET.restHeight;

        pos[k * 3] = x;
        pos[k * 3 + 1] = y;
        pos[k * 3 + 2] = z;
        if (trackBounds) {
          if (x < b.minX) b.minX = x;
          if (x > b.maxX) b.maxX = x;
          if (z < b.minZ) b.minZ = z;
          if (z > b.maxZ) b.maxZ = z;
          if (y < b.minY) b.minY = y;
        }
      }
    }
    layer.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.layers.forEach((l) => l.geometry.dispose());
  }
}
