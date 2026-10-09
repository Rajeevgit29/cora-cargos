// Physical description of the printed sheet. World units are arbitrary but
// consistent: the open spread is 3 × 2 (two portrait pages side by side).
//
//  Folded state (as it rests on the table):
//    fold A — the spine (vertical crease, x = 0): left half lies over the right half
//    fold B — the half fold (horizontal crease, z = 0): top half lies over the bottom half
//  The visible packet is therefore the bottom-right quarter of the sheet, and the
//  cover you see is the *outside* of the top-right quarter.
//  Unfolding runs B first (the first panel), then A (the second panel).

export const SHEET = {
  width: 3,
  height: 2,
  // Bend radius at each crease. B is folded over a two-layer stack, so its
  // radius must exceed twice A's or the inner layer would turn inside out.
  creaseRadiusA: 0.0034,
  creaseRadiusB: 0.0092,
  restHeight: 0.0025, // sheet floats this far above the table to avoid z-fighting
  edgeJitter: 0.0042, // irregular cut edges
};

export const QUALITY = {
  desktop: { segments: [132, 88], shadowMap: 2048, maxPixelRatio: 2, outsideTexture: 3072 },
  mobile: { segments: [84, 56], shadowMap: 1024, maxPixelRatio: 1.75, outsideTexture: 2048 },
};

// CSS pixel size of the offscreen "print plates" that are rasterised onto the
// outside of the sheet. Their aspect ratios must match the sheet regions.
export const PLATES = {
  quarter: [1200, 800], // cover + back page (W/2 × H/2)
  page: [1200, 1600], // inside-the-edition page and filler pages (W/2 × H)
};

export const CAMERA_FOV = 30;
