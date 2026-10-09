import { SHEET, CAMERA_FOV } from './config.js';
import { clamp, ease, lerp, monotone, span } from './tracks.js';

/*
 * THE SCROLL CHOREOGRAPHY
 * Every value below is a fraction of the pinned intro scroll (0 → 1).
 * Folds, paper motion, camera and the HTML handoff are separate groups, so
 * each can be retimed without touching the others.
 */
export const TIMELINE = {
  // Pinned scroll length, in viewport heights (also mirrored in intro.css).
  length: { desktop: 2.5, mobile: 2.0 },

  paper: {
    lift: { height: 0.17, up: [0.0, 0.11], down: [0.76, 0.93] },
    yaw: { from: -0.13, settle: [0.02, 0.88] }, // the paper sits askew on the table
    tilt: { amount: 0.05, in: [0.0, 0.12], out: [0.55, 0.85] }, // far edge rises as it is lifted
    sag: { amount: 0.05, in: [0.66, 0.76], out: [0.8, 0.92] }, // open sheet bows slightly in the air
    wobble: { out: [0.76, 0.92] }, // low-frequency unevenness, ironed out at the end
  },

  folds: {
    first: [0.1, 0.4], // fold B — horizontal half fold
    second: [0.43, 0.72], // fold A — the spine
    residual: { first: 0.1, second: 0.13, settle: [0.74, 0.92] }, // creases remember their fold
    curl: { trail: 0.3, droop: 0.2, twist: 0.28 }, // flexible paper, not cardboard
  },

  camera: {
    keys: [0, 0.4, 0.75, 0.94],
    elevation: [48, 62, 76, 90], // degrees above the table
    azimuth: [14, 7, 2, 0], // degrees around the paper
  },

  handoff: {
    unlit: [0.85, 0.95], // blend lighting out so the paper matches the HTML colour exactly
    creases: [0.83, 0.95], // crease shading fades as the page "becomes" the website
    vignette: [0.7, 0.92],
    desk: [0.72, 0.93], // the desk darkens and softens as the page fills the frame
    controls: [0.8, 0.9],
    fade: [0.955, 0.99], // canvas dissolves into the live HTML
    nav: 0.97,
  },
};

const DEG = Math.PI / 180;

function fitDistance(w, h, margin, aspect, elevation) {
  const t = 2 * Math.tan((CAMERA_FOV * DEG) / 2);
  const projectedH = h * Math.max(0.55, Math.sin(elevation));
  return Math.max((projectedH * margin) / t, (w * margin) / (t * aspect));
}

/**
 * Builds the camera tracks for a given handoff layout (they depend on viewport
 * shape). `startElevation` (degrees) overrides the opening angle, so the first
 * frame can match the perspective of a desk photograph.
 */
export function buildCameraTracks(layout, { startElevation, straight = false, holdWide = false } = {}) {
  const { width: W, height: H } = SHEET;
  const { keys } = TIMELINE.camera;
  // A photographed desk is shot straight on, so the camera does not orbit.
  const azimuth = straight ? TIMELINE.camera.azimuth.map(() => 0) : TIMELINE.camera.azimuth;
  const elevation = [...TIMELINE.camera.elevation];
  if (startElevation) {
    elevation[0] = startElevation;
    elevation[1] = Math.max(elevation[1], startElevation + 4);
    elevation[2] = Math.max(elevation[2], (elevation[1] + 90) / 2);
  }
  const a = layout.aspect;
  const portrait = layout.mode === 'page';
  const m0 = lerp(1.3, 2.45, clamp((a - 0.5) / 1.1));
  const m1 = lerp(1.1, 1.5, clamp((a - 0.5) / 1.1));
  const e = elevation.map((d) => d * DEG);

  const poses = [
    { x: W / 4, z: H / 4, dist: fitDistance(W / 2, H / 2, m0, a, e[0]) },
    { x: W / 4, z: 0, dist: fitDistance(W / 2, H, m1, a, e[1]) },
    portrait
      ? { x: W / 4, z: 0, dist: fitDistance(W / 2, H, 1.12, a, e[2]) }
      : { x: 0, z: 0, dist: fitDistance(W, H, 1.3, a, e[2]) },
    { x: layout.cx, z: layout.cz, dist: layout.distance },
  ];

  // With a photographed desk, the opening shot must already be the widest
  // view, so every later frame stays inside the photograph.
  // It is centred between the folded paper and the open spread, so the
  // unfolding footprint sits in the middle of the photograph.
  if (holdWide) {
    poses[0] = { x: W / 10, z: H / 14, dist: Math.max(poses[0].dist, poses[1].dist, poses[2].dist) * 1.04 };
    poses[1] = { ...poses[1], x: poses[0].x, z: poses[0].z }; // no sideways drift past the photo's edge
  }

  const track = (vals) => monotone(keys.map((k, i) => [k, vals[i]]));
  return {
    x: track(poses.map((p) => p.x)),
    z: track(poses.map((p) => p.z)),
    logDist: track(poses.map((p) => Math.log(p.dist))),
    elevation: track(e),
    azimuth: track(azimuth.map((d) => d * DEG)),
  };
}

/** Everything the scene needs for one frame, as a pure function of scroll progress. */
export function sampleTimeline(p, cameraTracks) {
  const { paper, folds, handoff } = TIMELINE;

  const lift = paper.lift.height * (span(p, paper.lift.up, ease.outCubic) - span(p, paper.lift.down, ease.inOutSine));
  const settle = span(p, folds.residual.settle, ease.inOutSine);
  const thetaB = lerp(Math.PI, folds.residual.first * (1 - settle), span(p, folds.first, ease.inOutCubic));
  const thetaA = lerp(Math.PI, folds.residual.second * (1 - settle), span(p, folds.second, ease.inOutCubic));

  return {
    p,
    thetaA,
    thetaB,
    lift,
    yaw: paper.yaw.from * (1 - span(p, paper.yaw.settle, ease.inOutSine)),
    tilt: paper.tilt.amount * span(p, paper.tilt.in, ease.outCubic) * (1 - span(p, paper.tilt.out, ease.inOutSine)),
    sag: paper.sag.amount * span(p, paper.sag.in, ease.inOutSine) * (1 - span(p, paper.sag.out, ease.inOutSine)),
    wobble: 1 - span(p, paper.wobble.out, ease.inOutSine),
    curl: folds.curl,
    unlit: span(p, handoff.unlit, ease.inOutSine),
    creases: 1 - span(p, handoff.creases, ease.inOutSine),
    vignette: 1 - span(p, handoff.vignette, ease.inOutSine),
    deskFade: span(p, handoff.desk, ease.inOutSine),
    controls: 1 - span(p, handoff.controls),
    fade: 1 - span(p, handoff.fade, ease.inOutSine),
    camera: {
      x: cameraTracks.x(p),
      z: cameraTracks.z(p),
      dist: Math.exp(cameraTracks.logDist(p)),
      elevation: cameraTracks.elevation(p),
      azimuth: cameraTracks.azimuth(p),
    },
  };
}
