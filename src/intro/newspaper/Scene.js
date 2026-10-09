import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SHEET, CAMERA_FOV, DESK } from './config.js';
import { PaperGeometry } from './PaperGeometry.js';
import { createPaperMaterial, createPaperUniforms, neutralLightMap } from './paperMaterial.js';
import { computeLayout } from './layout.js';
import { buildCameraTracks, sampleTimeline } from './timeline.js';
import {
  createContactTexture,
  createDeskUniforms,
  createLightMap,
  createPhotoDesk,
  createProceduralDesk,
  createWindowGobo,
} from './table.js';

/**
 * The opening scene: a folded newspaper on a desk in morning light. Renders on
 * demand only — call render(progress) whenever scroll progress changes.
 *
 * desk: { photo } for a photographed desk, or { wood, detail } for the
 * procedural walnut stand-in (all HTMLImageElements).
 */
export class NewspaperScene {
  constructor(canvas, { quality, outsideCanvas, fillerCanvas, paperColor, desk, camera = {} }) {
    this.quality = quality;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer = renderer;
    this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    this.maxTextureSize = Math.min(4096, renderer.capabilities.maxTextureSize);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a110b');
    this.scene = scene;
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.05, 60);

    // A soft studio environment, so glaze, glass, metal and the satin desk
    // pick up believable reflections.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    this.envMap = pmrem.fromScene(room, 0.04).texture;
    room.dispose?.();
    pmrem.dispose();
    scene.environment = this.envMap;
    scene.environmentIntensity = 0.35;

    this.paperUniforms = createPaperUniforms();
    this.paperUniforms.uPaper.value.set(paperColor);
    this.deskUniforms = createDeskUniforms();
    this.photoMode = !!desk.photo;
    this.cameraOptions = this.photoMode ? { startElevation: DESK.photo.elevation, straight: true, holdWide: true, ...camera } : camera;

    if (this.photoMode) this.#buildPhotoDesk(desk.photo);
    else this.#buildProceduralDesk(desk);

    // Ambient contact darkening that follows the paper's footprint and height.
    this.ground = new THREE.Group();
    this.contact = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: createContactTexture(), color: '#000', transparent: true, opacity: 0.5, depthWrite: false })
    );
    this.contact.rotation.x = -Math.PI / 2;
    this.contact.position.y = 0.0008;
    this.ground.add(this.contact);
    scene.add(this.ground);

    this.#buildPaper(outsideCanvas, fillerCanvas, paperColor);
    this._target = new THREE.Vector3();
    this.projector = new THREE.PerspectiveCamera(CAMERA_FOV, 16 / 9, 0.05, 60);
  }

  #buildProceduralDesk(desk) {
    const { scene, quality } = this;
    // Morning daylight from the upper left, through a window (gobo), plus a
    // low warm fill so shadows stay soft rather than black.
    scene.add(new THREE.HemisphereLight('#f3eee6', '#3a2617', 0.5));
    const fill = new THREE.DirectionalLight('#fff0dc', 0.3);
    fill.position.set(3, 2.5, 4);
    scene.add(fill);

    const sun = new THREE.SpotLight('#ffecd4', 2.9, 0, 0.4, 0.75, 0);
    sun.position.set(-4.8, 5.4, -3.9);
    sun.target.position.set(0.45, 0, 0.25);
    sun.map = createWindowGobo();
    sun.castShadow = true;
    sun.shadow.mapSize.set(quality.shadowMap, quality.shadowMap);
    sun.shadow.camera.near = 3;
    sun.shadow.camera.far = 16;
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.01;
    sun.shadow.radius = 4;
    sun.shadow.intensity = 0.82;
    scene.add(sun, sun.target);
    this.sun = sun;
    this.paperUniforms.uSunDir.value.copy(sun.position).sub(sun.target.position).normalize();
    this.paperUniforms.uLightMap.value = neutralLightMap();

    const { group } = createProceduralDesk(desk, this.deskUniforms, this.maxAnisotropy, { compact: quality.compact });
    scene.add(group);
  }

  #buildPhotoDesk(photo) {
    const { scene, quality } = this;
    const dir = new THREE.Vector3(...DESK.photo.sun).normalize();
    // Same light balance as the procedural desk; the photograph's own light
    // pattern reaches the paper through the light map.
    scene.add(new THREE.HemisphereLight('#f3eee6', '#3a2617', 0.5));
    const fill = new THREE.DirectionalLight('#fff0dc', 0.3);
    fill.position.set(3, 2.5, 4);
    scene.add(fill);
    const sun = new THREE.DirectionalLight('#ffecd4', 2.7);
    sun.position.copy(dir).multiplyScalar(8);
    sun.target.position.set(0, 0, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(quality.shadowMap, quality.shadowMap);
    Object.assign(sun.shadow.camera, { left: -3.6, right: 3.6, top: 3.6, bottom: -3.6, near: 1, far: 18 });
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.01;
    sun.shadow.radius = 4;
    sun.shadow.intensity = 0.85;
    scene.add(sun, sun.target);
    this.sun = sun;
    this.paperUniforms.uSunDir.value.copy(dir);
    this.paperUniforms.uLightMap.value = createLightMap(photo);
    this.paperUniforms.uLightAmount.value = 0.7;

    const desk = createPhotoDesk(photo, this.deskUniforms, this.maxAnisotropy);
    this.photoDesk = desk;
    scene.add(desk.group);
  }

  #buildPaper(outsideCanvas, fillerCanvas, paperColor) {
    this.paper = new PaperGeometry(this.quality.segments);
    this.outsideTexture = this.#canvasTexture(outsideCanvas);
    this.fillerTexture = this.#canvasTexture(fillerCanvas);
    this.insideTexture = this.#canvasTexture(solidCanvas(paperColor));
    const u = this.paperUniforms;
    const mat = {
      spread: createPaperMaterial({ map: this.insideTexture, side: THREE.FrontSide, uniforms: u }),
      cover: createPaperMaterial({ map: this.outsideTexture, side: THREE.BackSide, uniforms: u }),
      fillerFront: createPaperMaterial({ map: this.fillerTexture, side: THREE.FrontSide, uniforms: u }),
      fillerBack: createPaperMaterial({ map: this.fillerTexture, side: THREE.BackSide, uniforms: u }),
    };
    this.materials = mat;
    this.sheet = new THREE.Group();
    const last = this.paper.layers.length - 1;
    this.paper.layers.forEach((layer, k) => {
      // Outermost sheet carries the cover; innermost carries the printed spread.
      const inside = new THREE.Mesh(layer.geometry, k === last ? mat.spread : mat.fillerFront);
      const outside = new THREE.Mesh(layer.geometry, k === 0 ? mat.cover : mat.fillerBack);
      inside.receiveShadow = outside.receiveShadow = true;
      inside.frustumCulled = outside.frustumCulled = false;
      if (k === 0) inside.castShadow = true; // one caster stands in for the whole stack
      this.sheet.add(inside, outside);
    });
    mat.fillerFront.shadowSide = THREE.DoubleSide;
    mat.spread.shadowSide = THREE.DoubleSide;
    this.scene.add(this.sheet);
  }

  #canvasTexture(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.maxAnisotropy;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  /** Resize the drawing buffer and recompute the handoff mapping for this viewport. */
  setSize(width, height) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.layout = computeLayout(width, height, CAMERA_FOV);
    this.tracks = buildCameraTracks(this.layout, this.cameraOptions);
    this.#updateProjector();
    return this.layout;
  }

  /**
   * Photo mode: the photograph is projected from the opening camera pose,
   * cover-fitted to this viewport, so the first frame shows it undistorted.
   */
  #updateProjector() {
    const p = this.projector;
    this.#poseCamera(p, sampleTimeline(0, this.tracks));
    const viewAspect = this.layout.aspect;
    const photoAspect = this.photoDesk ? this.photoDesk.aspect : 16 / 9;
    const half = (CAMERA_FOV * Math.PI) / 360;
    const cover = photoAspect >= viewAspect ? Math.tan(half) : (Math.tan(half) * viewAspect) / photoAspect;
    p.fov = (360 / Math.PI) * Math.atan(cover * (this.photoMode ? DESK.photo.overscan : 1));
    p.aspect = photoAspect;
    p.updateProjectionMatrix();
    p.updateMatrixWorld(true);
    const m = new THREE.Matrix4().multiplyMatrices(p.projectionMatrix, p.matrixWorldInverse);
    this.paperUniforms.uProjector.value.copy(m);
    if (this.photoDesk) this.photoDesk.projectorUniform.value.copy(m);
  }

  /** Places the sheet for state `s` and orbits `cam` around its target. */
  #poseCamera(cam, s) {
    this.sheet.position.y = s.lift;
    this.sheet.rotation.set(s.tilt, s.yaw, 0, 'YXZ');
    this.sheet.updateMatrixWorld(true);
    const c = s.camera;
    const target = this._target.set(c.x, SHEET.restHeight + this.paper.topHeight, c.z);
    this.sheet.localToWorld(target);
    const ce = Math.cos(c.elevation);
    const se = Math.sin(c.elevation);
    const sa = Math.sin(c.azimuth);
    const ca = Math.cos(c.azimuth);
    cam.position.set(target.x + c.dist * ce * sa, target.y + c.dist * se, target.z + c.dist * ce * ca);
    cam.up.set(-se * sa, ce, -se * ca);
    cam.lookAt(target);
  }

  /** Texels per CSS pixel to print the inside spread at (≈ device pixels, capped by GPU limits). */
  insideScale() {
    const { sheetPxW, sheetPxH } = this.layout;
    return Math.min(this.renderer.getPixelRatio(), this.maxTextureSize / sheetPxW, this.maxTextureSize / sheetPxH);
  }

  setInsideCanvas(canvas) {
    const old = this.insideTexture;
    this.insideTexture = this.#canvasTexture(canvas);
    this.materials.spread.map = this.insideTexture;
    this.materials.spread.needsUpdate = true;
    old.dispose();
  }

  render(progress) {
    if (!this.layout) return;
    const s = sampleTimeline(progress, this.tracks);
    const bounds = this.paper.update(s);

    this.ground.rotation.y = s.yaw;
    this.paperUniforms.uUnlit.value = s.unlit;
    this.paperUniforms.uAge.value = s.creases;
    this.deskUniforms.uFade.value = s.deskFade;
    this.deskUniforms.uBlur.value = s.deskFade * 2.4;

    // Contact darkening: tight and dark on the desk, broad and faint when lifted.
    const h = s.lift + Math.max(0, bounds.minY);
    const grow = 1.12 + h * 2.6;
    this.contact.position.x = (bounds.minX + bounds.maxX) / 2;
    this.contact.position.z = (bounds.minZ + bounds.maxZ) / 2;
    this.contact.scale.set(((bounds.maxX - bounds.minX) * grow) / 0.62, ((bounds.maxZ - bounds.minZ) * grow) / 0.62, 1);
    this.contact.material.opacity = 0.55 * Math.max(0.22, 1 - h * 3.4) * (1 - s.unlit);

    // Camera: orbit the (moving) target, ending perpendicular to the page.
    this.#poseCamera(this.camera, s);
    this.renderer.render(this.scene, this.camera);
    return s;
  }

  dispose() {
    this.paper.dispose();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    this.envMap?.dispose();
    this.renderer.dispose();
  }
}

function solidCanvas(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 4;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 4, 4);
  return c;
}
