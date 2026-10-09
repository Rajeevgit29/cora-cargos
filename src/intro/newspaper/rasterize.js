/*
 * A deliberately small DOM → canvas "printer".
 *
 * It reproduces the subset of CSS used by the front page and the print plates:
 * text (per word, at the exact positions the browser laid it out), background
 * colours, solid/double/dotted/dashed borders, <img> with object-fit, element
 * opacity and `.ink-link` underlines. Pseudo-element content, shadows,
 * gradients and transforms are ignored — keep printed areas to that subset.
 *
 * Mark an element `data-print="skip"` to leave it off the paper.
 */

const metricsCache = new Map();
const range = typeof document !== 'undefined' ? document.createRange() : null;

function fontMetrics(ctx, font) {
  let m = metricsCache.get(font);
  if (!m) {
    ctx.font = font;
    const tm = ctx.measureText('Hxgjy');
    const asc = tm.fontBoundingBoxAscent ?? tm.actualBoundingBoxAscent ?? 0.8;
    const desc = tm.fontBoundingBoxDescent ?? tm.actualBoundingBoxDescent ?? 0.2;
    m = { ratio: asc / Math.max(1e-6, asc + desc) };
    metricsCache.set(font, m);
  }
  return m;
}

const isTransparent = (c) => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c) || /\/\s*0\)$/.test(c);

function transformText(text, mode) {
  if (mode === 'uppercase') return text.toUpperCase();
  if (mode === 'lowercase') return text.toLowerCase();
  return text;
}

function parsePosition(value) {
  const parts = (value || '50% 50%').split(/\s+/);
  const pct = (p, fallback) => (p && p.endsWith('%') ? parseFloat(p) / 100 : p === 'left' || p === 'top' ? 0 : p === 'right' || p === 'bottom' ? 1 : fallback);
  return [pct(parts[0], 0.5), pct(parts[1] ?? parts[0], 0.5)];
}

function drawBorderSide(ctx, style, color, width, x, y, w, h, vertical) {
  if (!width || style === 'none' || style === 'hidden' || isTransparent(color)) return;
  ctx.fillStyle = color;
  if (style === 'double') {
    const t = width / 3;
    if (vertical) {
      ctx.fillRect(x, y, t, h);
      ctx.fillRect(x + width - t, y, t, h);
    } else {
      ctx.fillRect(x, y, w, t);
      ctx.fillRect(x, y + width - t, w, t);
    }
    return;
  }
  if (style === 'dotted' || style === 'dashed') {
    const dash = style === 'dotted' ? width : width * 3;
    const gap = style === 'dotted' ? width * 1.6 : width * 2.2;
    const len = vertical ? h : w;
    for (let p = 0; p < len; p += dash + gap) {
      const l = Math.min(dash, len - p);
      if (vertical) ctx.fillRect(x, y + p, width, l);
      else ctx.fillRect(x + p, y, l, width);
    }
    return;
  }
  if (vertical) ctx.fillRect(x, y, width, h);
  else ctx.fillRect(x, y, w, width);
}

/**
 * Draws `root` and its descendants. The context must already be transformed so
 * that one unit equals one CSS pixel; `originX/originY` are the viewport
 * coordinates that should land at (0, 0). `region` (in those coordinates)
 * lets us skip anything that will not appear on the sheet.
 */
export function rasterize(root, ctx, { originX, originY, region, inset = 0, keep, clip = false, fallbackImageColor = '#d9d0bf' } = {}) {
  if (!root) return;
  const rootRect = root.getBoundingClientRect();
  const ox = originX ?? rootRect.left;
  const oy = originY ?? rootRect.top;

  const inRegion = (r) =>
    !region || !(r.right - ox < region.x || r.left - ox > region.x + region.w || r.bottom - oy < region.y || r.top - oy > region.y + region.h);
  // Type and pictures are only printed when they fit on the sheet entirely,
  // so nothing appears sliced in half by the paper's edge.
  // (Anything inside `keep` — the visible handoff frame — is always printed.)
  const fits = (r) =>
    !region ||
    (keep && r.right - ox > keep.x && r.left - ox < keep.x + keep.w && r.bottom - oy > keep.y && r.top - oy < keep.y + keep.h) ||
    (r.left - ox >= region.x + inset &&
      r.right - ox <= region.x + region.w - inset &&
      r.top - oy >= region.y + inset &&
      r.bottom - oy <= region.y + region.h - inset);

  const drawText = (node, cs, alpha) => {
    const text = node.nodeValue;
    if (!text || !text.trim()) return;
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.font = font;
    ctx.fillStyle = cs.color;
    ctx.globalAlpha = alpha;
    ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    const { ratio } = fontMetrics(ctx, font);
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0;
    const perChar = Math.abs(ls) > 0.05;
    const tt = cs.textTransform;

    const put = (str, r) => {
      if (!r || r.width === 0 || !fits(r)) return;
      ctx.fillText(transformText(str, tt), r.left - ox, r.top - oy + r.height * ratio);
    };
    const perCharacter = (start, end) => {
      for (let i = start; i < end; i++) {
        const ch = text[i];
        if (/\s/.test(ch)) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        put(ch, range.getClientRects()[0]);
      }
    };

    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) {
      const start = m.index;
      const end = start + m[0].length;
      if (perChar) {
        perCharacter(start, end);
        continue;
      }
      range.setStart(node, start);
      range.setEnd(node, end);
      const rects = range.getClientRects();
      if (rects.length === 1) put(m[0], rects[0]);
      else if (rects.length > 1) perCharacter(start, end);
    }
  };

  const walk = (el, parentAlpha) => {
    if (el.nodeType !== 1) return;
    if (el.dataset && el.dataset.print === 'skip') return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const alpha = parentAlpha * (el.classList.contains('reveal') ? 1 : parseFloat(cs.opacity || '1'));
    if (alpha < 0.005) return;

    const r = el.getBoundingClientRect();
    const isInline = cs.display === 'inline';
    // Blocks that start below the printable region cannot contribute to it.
    if (region && !isInline && r.top - oy > region.y + region.h) return;

    const x = r.left - ox;
    const y = r.top - oy;
    ctx.globalAlpha = alpha;

    if (!isInline) {
      if (!isTransparent(cs.backgroundColor)) {
        ctx.fillStyle = cs.backgroundColor;
        ctx.fillRect(x, y, r.width, r.height);
      }
      const bt = parseFloat(cs.borderTopWidth);
      const bb = parseFloat(cs.borderBottomWidth);
      const bl = parseFloat(cs.borderLeftWidth);
      const br = parseFloat(cs.borderRightWidth);
      drawBorderSide(ctx, cs.borderTopStyle, cs.borderTopColor, bt, x, y, r.width, r.height, false);
      drawBorderSide(ctx, cs.borderBottomStyle, cs.borderBottomColor, bb, x, y + r.height - bb, r.width, r.height, false);
      drawBorderSide(ctx, cs.borderLeftStyle, cs.borderLeftColor, bl, x, y, r.width, r.height, true);
      drawBorderSide(ctx, cs.borderRightStyle, cs.borderRightColor, br, x + r.width - br, y, r.width, r.height, true);
    }

    if (el.tagName === 'IMG' && fits(r)) {
      const pl = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
      const pt = parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth);
      const w = r.width - pl - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      const h = r.height - pt - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth);
      drawImage(ctx, el, cs, x + pl, y + pt, w, h, fallbackImageColor);
    }

    if (el.classList.contains('ink-link') && !el.dataset.printNoUnderline) {
      ctx.fillStyle = cs.color;
      for (const lr of el.getClientRects()) {
        ctx.fillRect(lr.left - ox, lr.bottom - oy - 1, lr.width, 1);
      }
    }

    for (const child of el.childNodes) {
      if (child.nodeType === 3) drawText(child, cs, alpha);
      else if (child.nodeType === 1) walk(child, alpha);
    }
  };

  ctx.save();
  if (clip) {
    ctx.beginPath();
    ctx.rect(rootRect.left - ox, rootRect.top - oy, rootRect.width, rootRect.height);
    ctx.clip();
  }
  if (region) {
    ctx.beginPath();
    ctx.rect(region.x + inset, region.y + inset, region.w - inset * 2, region.h - inset * 2);
    ctx.clip();
  }
  walk(root, 1);
  ctx.restore();
}

function drawImage(ctx, img, cs, x, y, w, h, fallback) {
  if (w <= 0 || h <= 0) return;
  if (!img.complete || !img.naturalWidth) {
    ctx.fillStyle = fallback;
    ctx.fillRect(x, y, w, h);
    return;
  }
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const fit = cs.objectFit;
  const [px, py] = parsePosition(cs.objectPosition);
  const useFilter = cs.filter && cs.filter !== 'none' && 'filter' in ctx;
  if (useFilter) ctx.filter = cs.filter;
  try {
    if (fit === 'cover' || fit === 'contain') {
      const s = fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
      if (fit === 'cover') {
        const sw = w / s;
        const sh = h / s;
        ctx.drawImage(img, (iw - sw) * px, (ih - sh) * py, sw, sh, x, y, w, h);
      } else {
        const dw = iw * s;
        const dh = ih * s;
        ctx.drawImage(img, x + (w - dw) * px, y + (h - dh) * py, dw, dh);
      }
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
  } catch {
    ctx.fillStyle = fallback;
    ctx.fillRect(x, y, w, h);
  }
  if (useFilter) ctx.filter = 'none';
}
