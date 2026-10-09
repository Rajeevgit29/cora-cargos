import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { site } from '../content.js';
import { isCompact } from '../lib/env.js';
import { DESK, QUALITY } from './newspaper/config.js';
import { cssVar, paintFiller, paintInside, paintOutside, setPaperTile } from './newspaper/textures.js';
import { loadImage } from '../lib/images.js';
import { TIMELINE } from './newspaper/timeline.js';
import { ease, span } from './newspaper/tracks.js';

const FONT_FACES = [
  '800 100px "Playfair Display Variable"',
  '400 100px "Instrument Serif"',
  'italic 400 100px "Instrument Serif"',
  '400 20px "Newsreader Variable"',
  'italic 400 20px "Newsreader Variable"',
  '400 12px "IBM Plex Mono"',
  '500 12px "IBM Plex Mono"',
];

async function fontsReady() {
  if (!document.fonts) return;
  await Promise.all(FONT_FACES.map((f) => document.fonts.load(f).catch(() => null)));
  await document.fonts.ready;
}

function imagesReady(root) {
  if (!root) return Promise.resolve();
  const imgs = [...root.querySelectorAll('img')].filter((img) => img.loading !== 'lazy');
  return Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth
        ? img.decode?.().catch(() => null)
        : new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          })
    )
  );
}

const timeout = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Desk assets: a photographed desk if one has been added (see README), else the
 * procedural walnut stand-in. `?desk=procedural` / `?desk=photo` force a mode.
 */
async function loadDesk(compact) {
  const params = new URLSearchParams(location.search);
  const force = params.get('desk');
  // Testing hooks: ?deskPhoto=/path.jpg&deskElevation=60 try a photograph without editing config.
  if (params.get('deskPhoto')) {
    const photo = await loadImage(params.get('deskPhoto'));
    if (params.get('deskElevation')) DESK.photo.elevation = Number(params.get('deskElevation'));
    if (photo) return { photo };
  }
  if (force !== 'procedural' && DESK.photo.src) {
    const photo = (compact && (await loadImage(DESK.photo.compact))) || (await loadImage(DESK.photo.src));
    if (photo) return { photo };
    console.warn(`Desk photo ${DESK.photo.src} could not be loaded; using the procedural desk.`);
  }
  const p = DESK.procedural;
  const [wood, detail] = await Promise.all([loadImage(compact ? p.woodCompact : p.wood), compact ? null : loadImage(p.detail)]);
  if (!wood) throw new Error('Desk texture failed to load');
  return { wood, detail };
}

/**
 * The pinned opening scene. Lives inside the `.pin` container next to the
 * sticky front page; both stay fixed while the visitor scrolls through the
 * intro, so the final 3D frame can dissolve into the HTML with nothing moving.
 */
export default function Intro({ pinRef, frontRef, spacerRef, afterRef, platesRef, apiRef, active, onProgress, onSkip, onFail }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const uiRef = useRef(null);
  const barRef = useRef(null);
  const vignetteRef = useRef(null);
  const atmosphereRef = useRef(null);
  const focusRef = useRef(null);
  const [ready, setReady] = useState(false);
  const activeRef = useRef(active);
  const redrawRef = useRef(() => {});
  const callbacks = useRef({ onProgress, onSkip, onFail });
  callbacks.current = { onProgress, onSkip, onFail };

  useEffect(() => {
    activeRef.current = active;
    if (active) requestAnimationFrame(() => redrawRef.current());
  }, [active]);

  useEffect(() => {
    let disposed = false;
    let scene = null;
    let trigger = null;
    let raf = 0;
    let last = 0;
    let target = 0;
    let current = 0;
    let size = { w: 0, h: 0 };
    let resizeTimer = 0;
    let printTimer = 0;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const quality = isCompact() ? QUALITY.mobile : QUALITY.desktop;

    const overlays = (p) => {
      const done = p >= 0.999;
      stage.style.opacity = String(1 - span(p, TIMELINE.handoff.fade, ease.inOutSine));
      stage.style.visibility = done ? 'hidden' : '';
      stage.dataset.state = done ? 'done' : 'playing';
      const ui = 1 - span(p, TIMELINE.handoff.controls);
      if (uiRef.current) {
        uiRef.current.style.opacity = String(ui);
        uiRef.current.style.visibility = ui < 0.02 ? 'hidden' : '';
      }
      const vignette = String(1 - span(p, TIMELINE.handoff.vignette, ease.inOutSine));
      if (vignetteRef.current) vignetteRef.current.style.opacity = vignette;
      if (atmosphereRef.current) atmosphereRef.current.style.opacity = vignette;
      // Shallow focus belongs to the still photograph; it clears as the paper lifts.
      if (focusRef.current) focusRef.current.style.opacity = String(1 - span(p, TIMELINE.handoff.focus, ease.inOutSine));
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, p / 0.93).toFixed(4)})`;
      callbacks.current.onProgress?.(p);
    };

    const draw = (p) => {
      overlays(p);
      if (scene && activeRef.current && p < 0.999 && size.w) scene.render(p);
    };
    redrawRef.current = () => {
      resize();
      draw(current);
    };

    const tick = (now) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      current += (target - current) * (1 - Math.exp(-dt * 8.5));
      if (Math.abs(target - current) < 0.0003) current = target;
      draw(current);
      if (current !== target) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        last = 0;
      }
    };

    const setTarget = (p, immediate = false) => {
      target = p;
      if (immediate) {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        current = p;
        draw(current);
      } else if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    // Print the live front page onto the inside of the sheet.
    const print = () => {
      const fp = frontRef.current;
      const pin = pinRef.current;
      if (!scene || !fp || !pin || !size.w) return;
      const fpRect = fp.getBoundingClientRect();
      const sources = [{ el: fp, originY: fpRect.top }];
      if (afterRef.current) sources.push({ el: afterRef.current, originY: pin.getBoundingClientRect().bottom - fpRect.height });
      const pageOffsetY = (pin.offsetTop || 0) + (spacerRef.current?.offsetHeight || 0);
      const inside = paintInside({ layout: scene.layout, scale: scene.insideScale(), sources, filler: platesRef.current?.filler, pageOffsetY });
      scene.setInsideCanvas(inside);
    };
    const schedulePrint = () => {
      clearTimeout(printTimer);
      printTimer = setTimeout(() => {
        print();
        draw(current);
      }, 120);
    };

    const resize = (force = false) => {
      if (!scene) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      if (!force && w === size.w && h === size.h) return;
      size = { w, h };
      scene.setSize(w, h);
      print();
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        draw(current);
      }, 140);
    };

    // Very fast scrolls past the end: jump to the final frame so the canvas
    // never lags behind the page that is already moving.
    const onScroll = () => {
      if (!trigger) return;
      if (current < 1 && window.scrollY > trigger.end + 48) setTarget(1, true);
    };

    // Jump to the end of the intro: the open, readable front page.
    const finish = () => {
      const end = trigger ? trigger.end : (pinRef.current?.offsetTop || 0) + (spacerRef.current?.offsetHeight || 0);
      window.scrollTo({ top: end, behavior: 'auto' });
      setTarget(1, true);
    };
    if (apiRef) apiRef.current = { finish };

    // Keyboard users tabbing into the page skip straight to it (focus stays put).
    const onFocusIn = (e) => {
      if (target >= 1 || stage.contains(e.target)) return;
      if (pinRef.current?.parentElement?.contains(e.target)) finish();
    };

    const onContextLost = (e) => {
      e.preventDefault();
      callbacks.current.onFail?.();
    };

    const ro = new ResizeObserver(onResize);

    (async () => {
      try {
        // three.js loads as its own chunk, in parallel with fonts and images.
        const scenePromise = import('./newspaper/Scene.js');
        const deskPromise = loadDesk(quality.compact);
        const tilePromise = loadImage(DESK.paperTile.src).then(setPaperTile);
        await fontsReady();
        await Promise.race([Promise.all([imagesReady(platesRef.current?.root), imagesReady(frontRef.current)]), timeout(6000)]);
        if (disposed) return;
        const [{ NewspaperScene }, desk] = await Promise.all([scenePromise, deskPromise, tilePromise]);
        if (disposed) return;
        const outside = paintOutside(quality.outsideTexture, platesRef.current);
        const filler = paintFiller(quality.compact ? 1024 : 2048);
        // Testing hook: ?deskElevation=66&straight=1 previews a photo-style camera on the procedural desk.
        const qp = new URLSearchParams(location.search);
        const camera = desk.photo || !qp.get('deskElevation') ? {} : { startElevation: Number(qp.get('deskElevation')), straight: qp.has('straight'), holdWide: qp.has('holdWide') };
        scene = new NewspaperScene(canvas, { quality, outsideCanvas: outside, fillerCanvas: filler, paperColor: cssVar('--paper', '#f2ecdf'), desk, camera });
        canvas.addEventListener('webglcontextlost', onContextLost);
        resize(true);
        trigger = ScrollTrigger.create({
          trigger: pinRef.current,
          start: 'top top',
          end: () => `+=${spacerRef.current?.offsetHeight || 1}`,
          onUpdate: (self) => setTarget(self.progress),
          onRefresh: (self) => setTarget(self.progress, true),
        });
        ro.observe(stage);
        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('focusin', onFocusIn);
        document.fonts?.addEventListener?.('loadingdone', schedulePrint);
        frontRef.current?.querySelectorAll('img').forEach((img) => img.addEventListener('load', schedulePrint));
        setTarget(trigger.progress, true);
        setReady(true);
        if (import.meta.env.DEV) window.__intro = { scene, setTarget, get progress() { return current; } };
      } catch (err) {
        console.error('Intro failed, showing the newspaper directly.', err);
        callbacks.current.onFail?.();
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      clearTimeout(printTimer);
      ro.disconnect();
      trigger?.kill();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('focusin', onFocusIn);
      document.fonts?.removeEventListener?.('loadingdone', schedulePrint);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      scene?.dispose();
      if (apiRef) apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stage-track">
      <div ref={stageRef} className={`stage${ready ? ' is-ready' : ''}`} data-state="playing">
        <canvas ref={canvasRef} className="stage__canvas" aria-hidden="true" />
        <div ref={focusRef} className="stage__focus" aria-hidden="true">
          <span className="stage__focus-far" />
          <span className="stage__focus-near" />
        </div>
        <div ref={vignetteRef} className="stage__vignette" aria-hidden="true" />
        <div ref={atmosphereRef} className="stage__atmosphere" aria-hidden="true">
          <span className="stage__haze" />
          <span className="stage__grain" />
        </div>
        <p className="stage__loader" aria-hidden="true">
          Printing today’s edition…
        </p>
        <div ref={uiRef} className="stage__ui">
          <p className="sr-only">
            Animated introduction: a folded newspaper unfolds as you scroll and becomes this website. Use “Skip intro” to go straight to
            the portfolio.
          </p>
          <div className="stage__top">
            <span className="stage__label">
              {site.edition.number} · {site.edition.title}
            </span>
            <button type="button" className="stage__skip" onClick={() => callbacks.current.onSkip?.()}>
              Skip intro <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="stage__bottom" aria-hidden="true">
            <span className="stage__cue">Scroll to unfold</span>
            <span className="stage__bar">
              <span ref={barRef} className="stage__bar-fill" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
