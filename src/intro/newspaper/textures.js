import { PLATES } from './config.js';
import { rasterize } from './rasterize.js';
import { grainTile } from '../../lib/grain.js';

export function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(4, Math.round(w));
  c.height = Math.max(4, Math.round(h));
  return c;
}

/** Base stock: ivory, grain at the same CSS-pixel scale as the page background. */
function paintStock(ctx, w, h, cssScale) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = cssVar('--paper', '#f2ecdf');
  ctx.fillRect(0, 0, w, h);
  ctx.setTransform(cssScale, 0, 0, cssScale, 0, 0);
  ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
  ctx.fillRect(0, 0, w / cssScale + 1, h / cssScale + 1);
  ctx.restore();
}

/** Very slight warm darkening at the cut edges (kept outside the handoff frame). */
function ageEdges(ctx, w, h, depth, strength = 0.09) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tint = (a) => `rgba(130, 96, 52, ${a})`;
  const side = (x0, y0, x1, y1, rx, ry, rw, rh) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, tint(strength));
    g.addColorStop(1, tint(0));
    ctx.fillStyle = g;
    ctx.fillRect(rx, ry, rw, rh);
  };
  side(0, 0, depth, 0, 0, 0, depth, h);
  side(w, 0, w - depth, 0, w - depth, 0, depth, h);
  side(0, 0, 0, depth, 0, 0, w, depth);
  side(0, h, 0, h - depth, 0, h - depth, w, depth);
  ctx.restore();
}

/**
 * The outside of the sheet. Regions are printed in the orientation they will
 * be *seen* in once folded:
 *   top-right quarter → cover (fold B flips it, so it is printed mirrored vertically)
 *   left half         → "inside this edition" page (fold A flips it: mirrored horizontally)
 *   bottom-right      → back page (faces the table)
 */
export function paintOutside(size, plates) {
  const cw = size;
  const ch = Math.round((size * 2) / 3);
  const canvas = makeCanvas(cw, ch);
  const ctx = canvas.getContext('2d');
  const [qw, qh] = PLATES.quarter;
  const [pw, ph] = PLATES.page;
  paintStock(ctx, cw, ch, cw / 2 / qw);

  ctx.setTransform(cw / 2 / qw, 0, 0, -(ch / 2) / qh, cw / 2, ch / 2);
  rasterize(plates.cover, ctx, { clip: true });

  ctx.setTransform(-(cw / 2) / pw, 0, 0, ch / ph, cw / 2, 0);
  rasterize(plates.edition, ctx, { clip: true });

  ctx.setTransform(-(cw / 2) / qw, 0, 0, ch / 2 / qh, cw, ch / 2);
  rasterize(plates.back, ctx, { clip: true });

  ageEdges(ctx, cw, ch, cw * 0.014);
  return canvas;
}

/** Greeked columns of type for margins of the sheet that no HTML maps onto. */
function greek(ctx, x, y, w, h, seed = 3) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ink = cssVar('--ink', '#1d1b19');
  const pad = Math.min(16, w * 0.1);
  const lw = w - pad * 2;
  let cy = y + 64;
  ctx.save();
  ctx.fillStyle = ink;
  let para = 0;
  while (cy < y + h - 48) {
    if (para === 0 && rnd() < 0.18) {
      // A small headline above a hairline.
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x + pad, cy, lw, 0.8);
      cy += 12;
      ctx.globalAlpha = 0.42;
      ctx.fillRect(x + pad, cy, lw * (0.55 + rnd() * 0.35), 5.5);
      ctx.fillRect(x + pad, cy + 9, lw * (0.3 + rnd() * 0.3), 5.5);
      cy += 26;
      para = 4 + Math.floor(rnd() * 6);
      continue;
    }
    ctx.globalAlpha = 0.16;
    const last = para === 1;
    ctx.fillRect(x + pad, cy, last ? lw * (0.25 + rnd() * 0.5) : lw, 1.7);
    cy += last ? 13 : 6.4;
    para = Math.max(0, para - 1);
  }
  ctx.restore();
}

/**
 * The inside spread: the live HTML front page, printed with the exact mapping
 * the camera will use at the end of the intro (see layout.js).
 *   sources: [{ el, originY }] — DOM roots and the viewport Y that corresponds
 *            to the top of the handoff frame for that root.
 */
export function paintInside({ layout, scale, sources, filler }) {
  const { x0, y0, sheetPxW, sheetPxH, vw } = layout;
  const cw = Math.round(sheetPxW * scale);
  const ch = Math.round(sheetPxH * scale);
  const canvas = makeCanvas(cw, ch);
  const ctx = canvas.getContext('2d');
  paintStock(ctx, cw, ch, scale);

  if (layout.mode === 'page') {
    // Phones zoom into the right-hand page; give the left page its own layout.
    if (filler) {
      const s = (sheetPxW / 2 / PLATES.page[0]) * scale;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      rasterize(filler, ctx, { clip: true });
    }
    ctx.setTransform(scale, 0, 0, scale, -x0 * scale, -y0 * scale);
    const pageLeft = x0 + sheetPxW / 2;
    const pageRight = x0 + sheetPxW;
    if (-pageLeft > 40) greek(ctx, pageLeft, y0, -pageLeft, sheetPxH, 7);
    if (pageRight - vw > 40) greek(ctx, vw, y0, pageRight - vw, sheetPxH, 11);
  }

  ctx.setTransform(scale, 0, 0, scale, -x0 * scale, -y0 * scale);
  const region = { x: x0, y: y0, w: sheetPxW, h: sheetPxH };
  for (const { el, originY } of sources) {
    rasterize(el, ctx, { originX: 0, originY, region, inset: 14, keep: { x: 0, y: 0, w: vw, h: layout.vh } });
  }

  ageEdges(ctx, cw, ch, Math.min(cw, ch) * 0.012, 0.07);
  return canvas;
}
