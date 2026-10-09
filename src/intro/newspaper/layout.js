import { SHEET, CAMERA_FOV } from './config.js';

/**
 * The handoff contract between the 3D sheet and the HTML front page.
 *
 * At the end of the intro the camera looks straight down at the open sheet and
 * frames a rectangle R (in sheet coordinates) whose aspect equals the viewport.
 * Because the sheet is flat and perpendicular to the view axis, the mapping
 * from viewport pixels to sheet coordinates is a pure scale + offset:
 *
 *   sheetX = cx + (px - vw / 2) / k        sheetZ = cz + (py - vh / 2) / k
 *
 * The inside of the sheet is printed using this same mapping (see textures.js),
 * so the final 3D frame and the live HTML line up pixel for pixel.
 */
export function computeLayout(vw, vh, fov = CAMERA_FOV) {
  const { width: W, height: H } = SHEET;
  const aspect = vw / vh;

  // Narrow (phone) screens zoom into the right-hand page; everything else
  // frames the full spread, overscanning slightly so no edge is visible.
  const pageModeMaxAspect = (0.94 * (W / 2)) / (0.96 * H);
  let mode, Rw, Rh, cx;
  if (aspect <= pageModeMaxAspect) {
    mode = 'page';
    Rh = 0.96 * H;
    Rw = Rh * aspect;
    cx = W / 4;
  } else {
    mode = 'spread';
    Rw = Math.min(0.94 * W, 0.96 * H * aspect);
    Rh = Rw / aspect;
    cx = 0;
  }
  const marginTop = Math.min(0.025 * H, (H - Rh) / 2);
  const cz = -H / 2 + marginTop + Rh / 2;

  const k = vw / Rw; // CSS px per world unit at the end of the intro
  const distance = Rh / 2 / Math.tan(((fov * Math.PI) / 180) / 2);

  // Where the sheet's top-left corner lands, in handoff-viewport pixels.
  const x0 = vw / 2 - (cx + W / 2) * k;
  const y0 = vh / 2 - (cz + H / 2) * k;

  return { vw, vh, aspect, mode, Rw, Rh, cx, cz, k, distance, x0, y0, sheetPxW: W * k, sheetPxH: H * k };
}
