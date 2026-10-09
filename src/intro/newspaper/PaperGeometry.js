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
  constructor([nx, nz]) {
    if (nx % 2 || nz % 2) throw new Error('Paper segments must be even so creases fall on vertices.');
    const W = SHEET.width;
    const H = SHEET.height;
    const cols = nx + 1;
    const rows = nz + 1;
    const count = cols * rows;
    Object.assign(this, { nx, nz, cols, rows, count, W, H, dx: W / nx, dz: H / nz });

    this.restX = new Float32Array(count);
    this.restZ = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    const J = SHEET.edgeJitter;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const u = i / nx;
        const v = j / nz;
        let x = -W / 2 + u * W;
        let z = -H / 2 + v * H;
        // Slightly irregular cut edges and softened corners.
        if (i === 0) x += J * noise1(j * 0.37 + 3.1);
        if (i === nx) x -= J * noise1(j * 0.41 + 9.7);
        if (j === 0) z += J * noise1(i * 0.29 + 1.3);
        if (j === nz) z -= J * noise1(i * 0.33 + 5.9);
        if ((i === 0 || i === nx) && (j === 0 || j === nz)) {
          x += (i === 0 ? 1 : -1) * J * 0.9;
          z += (j === 0 ? 1 : -1) * J * 0.9;
        }
        this.restX[k] = x;
        this.restZ[k] = z;
        positions[k * 3] = x;
        positions[k * 3 + 2] = z;
        uvs[k * 2] = u;
        uvs[k * 2 + 1] = 1 - v;
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

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    geometry.computeVertexNormals();
    this.geometry = geometry;

    // Pre-allocated curve buffers: one per curl sample, for each fold.
    this.curvesA = Array.from({ length: CURL_SAMPLES }, () => new Float32Array((nx / 2 + 1) * 4));
    this.curvesB = Array.from({ length: CURL_SAMPLES }, () => new Float32Array((nz / 2 + 1) * 4));
    this.bounds = { minX: 0, maxX: 0, minZ: 0, maxZ: 0, minY: 0 };
  }

  update(state) {
    const { nx, nz, cols, rows, W, H, dx, dz } = this;
    const { thetaA, thetaB, curl, sag, wobble } = state;
    const iA = nx / 2; // crease column
    const jB = nz / 2; // crease row
    const twist = curl.twist;

    for (let s = 0; s < CURL_SAMPLES; s++) {
      const tf = 1 + (twist * s) / (CURL_SAMPLES - 1);
      bendCurve(this.curvesA[s], iA, dx, thetaA, SHEET.creaseRadiusA, W / 2, curl, tf);
      bendCurve(this.curvesB[s], jB, dz, thetaB, SHEET.creaseRadiusB, H / 2, curl, tf);
    }

    const pos = this.geometry.attributes.position.array;
    const b = this.bounds;
    b.minX = b.minZ = b.minY = Infinity;
    b.maxX = b.maxZ = -Infinity;
    const out = [0, 0, 0, 0];

    const sampleCurve = (curves, k, t) => {
      // t ∈ [0, 1] along the curl samples
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
        const rx = this.restX[k];
        const rz = this.restZ[k];
        let x = rx;
        let y = 0;
        let z = rz;

        // Fold A — the spine. The flap is x < 0; distance from crease is -x.
        if (i < iA) {
          const tz = rz / (H / 2);
          const c = sampleCurve(this.curvesA, iA - i, tz * tz);
          const extra = -rx - (iA - i) * dx; // edge jitter, carried along the tangent
          const tu = c[3]; // tangent = (ny, -nu) rotated: (cos α, sin α) = (n.y, -n.x)
          const ty = -c[2];
          x = -(c[0] + extra * tu);
          y = c[1] + extra * ty;
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
        if (x < b.minX) b.minX = x;
        if (x > b.maxX) b.maxX = x;
        if (z < b.minZ) b.minZ = z;
        if (z > b.maxZ) b.maxZ = z;
        if (y < b.minY) b.minY = y;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
    return b;
  }

  dispose() {
    this.geometry.dispose();
  }
}
