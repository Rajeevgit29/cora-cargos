import * as THREE from 'three';
import { SHEET, CAMERA_FOV } from './config.js';
import { PaperGeometry } from './PaperGeometry.js';
import { createPaperMaterial } from './paperMaterial.js';
import { computeLayout } from './layout.js';
import { buildCameraTracks, sampleTimeline } from './timeline.js';
import { createContactTexture, createProps, createWoodTexture } from './table.js';

/**
 * The opening scene: a folded newspaper on a table. Renders on demand only —
 * call render(progress) whenever scroll progress changes.
 */
export class NewspaperScene {
  constructor(canvas, { quality, outsideCanvas, paperColor }) {
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
    scene.background = new THREE.Color('#2a1d14');
    this.scene = scene;
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.05, 60);

    // Light: one warm window light, a soft fill. Restrained on purpose.
    scene.add(new THREE.HemisphereLight('#fff6ea', '#4a3829', 1.15));
    const key = new THREE.DirectionalLight('#fff3e3', 2.25);
    key.position.set(-2.6, 6.4, 2.4);
    key.target.position.set(0.2, 0, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(quality.shadowMap, quality.shadowMap);
    Object.assign(key.shadow.camera, { left: -3.4, right: 3.4, top: 3.4, bottom: -3.4, near: 1, far: 16 });
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.012;
    key.shadow.radius = 3.5;
    key.shadow.intensity = 0.78;
    scene.add(key, key.target);

    // Table.
    const wood = createWoodTexture(quality.shadowMap >= 2048 ? 2048 : 1024, this.maxAnisotropy);
    const table = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.MeshStandardMaterial({ map: wood, roughness: 0.6, metalness: 0 })
    );
    table.rotation.x = -Math.PI / 2;
    table.position.set(0.4, 0, 0.2);
    table.receiveShadow = true;
    scene.add(table);
    scene.add(createProps());

    // The sheet. Ground group shares the paper's yaw so the contact shadow follows it.
    this.ground = new THREE.Group();
    this.contact = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: createContactTexture(), color: '#000', transparent: true, opacity: 0.4, depthWrite: false })
    );
    this.contact.rotation.x = -Math.PI / 2;
    this.contact.position.y = 0.0008;
    this.ground.add(this.contact);
    scene.add(this.ground);

    this.paper = new PaperGeometry(quality.segments);
    this.uniforms = { uUnlit: { value: 0 }, uCreases: { value: 1 } };
    this.outsideTexture = this.#canvasTexture(outsideCanvas);
    this.insideTexture = this.#canvasTexture(solidCanvas(paperColor));
    const inside = new THREE.Mesh(
      this.paper.geometry,
      createPaperMaterial({ map: this.insideTexture, side: THREE.FrontSide, uniforms: this.uniforms })
    );
    inside.material.shadowSide = THREE.DoubleSide;
    inside.castShadow = true;
    inside.receiveShadow = true;
    const outside = new THREE.Mesh(
      this.paper.geometry,
      createPaperMaterial({ map: this.outsideTexture, side: THREE.BackSide, uniforms: this.uniforms })
    );
    outside.receiveShadow = true;
    inside.frustumCulled = outside.frustumCulled = false;
    this.meshes = { inside, outside };
    this.sheet = new THREE.Group();
    this.sheet.add(inside, outside);
    scene.add(this.sheet);

    this._target = new THREE.Vector3();
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
    this.tracks = buildCameraTracks(this.layout);
    return this.layout;
  }

  /** Texels per CSS pixel to print the inside spread at (≈ device pixels, capped by GPU limits). */
  insideScale() {
    const { sheetPxW, sheetPxH } = this.layout;
    return Math.min(this.renderer.getPixelRatio(), this.maxTextureSize / sheetPxW, this.maxTextureSize / sheetPxH);
  }

  setInsideCanvas(canvas) {
    const old = this.insideTexture;
    this.insideTexture = this.#canvasTexture(canvas);
    this.meshes.inside.material.map = this.insideTexture;
    this.meshes.inside.material.needsUpdate = true;
    old.dispose();
  }

  render(progress) {
    if (!this.layout) return;
    const s = sampleTimeline(progress, this.tracks);
    const bounds = this.paper.update(s);

    this.sheet.position.y = s.lift;
    this.sheet.rotation.set(s.tilt, s.yaw, 0, 'YXZ');
    this.ground.rotation.y = s.yaw;
    this.uniforms.uUnlit.value = s.unlit;
    this.uniforms.uCreases.value = s.creases;

    // Contact darkening: tight and dark on the table, broad and faint when lifted.
    const h = s.lift + Math.max(0, bounds.minY);
    const grow = 1.18 + h * 2.4;
    this.contact.position.x = (bounds.minX + bounds.maxX) / 2;
    this.contact.position.z = (bounds.minZ + bounds.maxZ) / 2;
    this.contact.scale.set((bounds.maxX - bounds.minX) * grow / 0.6, (bounds.maxZ - bounds.minZ) * grow / 0.6, 1);
    this.contact.material.opacity = 0.42 * Math.max(0.25, 1 - h * 3.2) * (1 - s.unlit);

    // Camera: orbit the (moving) target, ending perpendicular to the page.
    const cam = s.camera;
    this.sheet.updateMatrixWorld(true);
    const target = this._target.set(cam.x, SHEET.restHeight, cam.z);
    this.sheet.localToWorld(target);
    const ce = Math.cos(cam.elevation);
    const se = Math.sin(cam.elevation);
    const sa = Math.sin(cam.azimuth);
    const ca = Math.cos(cam.azimuth);
    this.camera.position.set(target.x + cam.dist * ce * sa, target.y + cam.dist * se, target.z + cam.dist * ce * ca);
    this.camera.up.set(-se * sa, ce, -se * ca);
    this.camera.lookAt(target);

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
