const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

export function prefersReducedMotion() {
  if (params.get('motion') === 'reduce') return true;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ok = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

/** Phones and small tablets get the lighter intro. */
export function isCompact() {
  return matchMedia('(max-width: 760px)').matches;
}

/**
 * The 3D intro plays unless motion is reduced or WebGL is missing.
 * Testing overrides: ?intro=0 (skip it) or ?intro=1 (force it).
 */
export function introAllowed() {
  if (params.get('intro') === '0') return false;
  if (!supportsWebGL()) return false;
  if (params.get('intro') === '1') return true;
  return !prefersReducedMotion();
}

export function editionDate(d = new Date()) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function parseRoute(hash = location.hash) {
  const m = hash.match(/^#\/work\/([\w-]+)/);
  if (m) return { name: 'case', slug: m[1] };
  const anchor = hash.startsWith('#') && !hash.startsWith('#/') && hash.length > 1 ? hash.slice(1) : null;
  return { name: 'paper', anchor };
}
