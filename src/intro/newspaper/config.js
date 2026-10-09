// Physical description of the printed sheet. World units are arbitrary but
// consistent: the open spread is 3 × 2 (two portrait pages side by side).
//
//  Folded state (as it rests on the desk):
//    fold A — the spine (vertical crease, x = 0): left half lies over the right half
//    fold B — the half fold (horizontal crease, z = 0): top half lies over the bottom half
//  The visible packet is therefore the bottom-right quarter of the sheet, and the
//  cover you see is the *outside* of the top-right quarter.
//  Unfolding runs B first (the first panel), then A (the second panel).

export const SHEET = {
  width: 3,
  height: 2,
  // The paper is a few nested sheets, so its edges show real layers.
  layers: 3,
  layerGap: 0.0011, // thickness of one sheet
  // Bend radius at each crease. A must exceed the nested stack; B is folded over
  // the whole stack after A, so it must exceed twice A's radius.
  creaseRadiusA: 0.0034,
  creaseRadiusB: 0.0092,
  restHeight: 0.0025, // sheet floats this far above the desk to avoid z-fighting
  edgeJitter: 0.0042, // irregular cut edges
};

export const QUALITY = {
  desktop: { segments: [132, 88], shadowMap: 2048, maxPixelRatio: 2, outsideTexture: 3072, compact: false },
  mobile: { segments: [84, 56], shadowMap: 1024, maxPixelRatio: 1.75, outsideTexture: 2048, compact: true },
};

// CSS pixel size of the offscreen "print plates" that are rasterised onto the
// outside of the sheet. Their aspect ratios must match the sheet regions.
export const PLATES = {
  quarter: [1200, 800], // cover + back page (W/2 × H/2)
  page: [1200, 1600], // inside-the-edition page and filler pages (W/2 × H)
};

export const CAMERA_FOV = 30;

/*
 * THE DESK
 * Set `photo.src` to a photographed desk (e.g. generated with Higgsfield — see
 * README) to use it; while it is null, the scene uses the procedural walnut
 * stand-in with a window-light gobo and modelled cup and pencil.
 *
 * Photo mode projects the image onto the desk plane from the opening camera,
 * so the first frame is exactly the photograph and later camera moves get
 * consistent ground-plane parallax. Match `elevation` to the angle the photo
 * appears to be shot from, and `sun` to its light direction (x right, y up,
 * z toward the viewer; upper-left daylight ≈ [-0.55, 0.65, -0.52]).
 */
export const DESK = {
  photo: {
    src: null, // e.g. '/assets/desk/desk-photo.jpg'  (2560 px wide, landscape)
    compact: null, // optional smaller version for phones, e.g. '/assets/desk/desk-photo-1280.jpg'
    elevation: 66,
    sun: [-0.55, 0.65, -0.52],
    overscan: 1.15, // the opening frame shows the central ~87% of the photo, leaving margin for camera moves
  },
  procedural: {
    wood: '/assets/desk/walnut.jpg',
    woodCompact: '/assets/desk/walnut-compact.jpg',
    detail: '/assets/desk/walnut-detail.jpg',
    size: [8, 5.333], // scene units covered by the wood texture
    centre: [0.4, -0.2],
  },
  paperTile: { src: '/assets/paper/newsprint.jpg', cssSize: 384 },
};
