import * as THREE from 'three';
import { SHEET } from './config.js';

/**
 * Shared uniforms for every paper surface (all sheets, both sides).
 *  uUnlit      0 → lit by the scene, 1 → exactly the printed texture (handoff)
 *  uAge        strength of the physical print effects: creases, ink density
 *              variation, stock tone, edge sheen. Fades to 0 before the handoff.
 *  uLight*     daylight pattern sampled from the desk photograph (photo mode),
 *              carried along the sun direction so lifted paper sees shifted light.
 */
export function createPaperUniforms() {
  return {
    uUnlit: { value: 0 },
    uAge: { value: 1 },
    uPaper: { value: new THREE.Color('#f2ecdf') },
    uLightMap: { value: null },
    uLightAmount: { value: 0 },
    uProjector: { value: new THREE.Matrix4() },
    uSunDir: { value: new THREE.Vector3(-0.55, 0.65, -0.52).normalize() },
  };
}

const NOISE = /* glsl */ `
  float ppHash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float ppNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(ppHash(i), ppHash(i + vec2(1.0, 0.0)), u.x), mix(ppHash(i + vec2(0.0, 1.0)), ppHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
`;

export function createPaperMaterial({ map, side, uniforms }) {
  const material = new THREE.MeshStandardMaterial({
    map,
    side,
    roughness: 0.9,
    metalness: 0,
  });
  const W = SHEET.width.toFixed(3);
  const H = SHEET.height.toFixed(3);

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPaperWorld;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvPaperWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uUnlit;
        uniform float uAge;
        uniform vec3 uPaper;
        uniform sampler2D uLightMap;
        uniform float uLightAmount;
        uniform mat4 uProjector;
        uniform vec3 uSunDir;
        varying vec3 vPaperWorld;
        ${NOISE}`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          vec2 sheet = vMapUv * vec2(${W}, ${H});
          // Ink density varies a little across the page, as on a real press.
          float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          float paperLum = dot(uPaper, vec3(0.2126, 0.7152, 0.0722));
          float ink = clamp(1.0 - lum / paperLum, 0.0, 1.0);
          float press = ppNoise(sheet * 16.0) * 0.5 + ppNoise(sheet * 52.0) * 0.5;
          diffuseColor.rgb = mix(diffuseColor.rgb, uPaper, ink * (0.012 + 0.045 * press) * uAge);
          // Restrained tonal variation in the stock itself.
          diffuseColor.rgb *= 1.0 + (ppNoise(sheet * 2.3 + 4.0) - 0.5) * 0.05 * uAge;
          // Creases on the real fold lines: a fine dark valley with a soft
          // shoulder, and a faint highlight where the ridge catches light.
          float da = abs(vMapUv.x - 0.5) * ${W};
          float db = abs(vMapUv.y - 0.5) * ${H};
          float valley = 0.15 * exp(-da * da / 0.0000045) + 0.05 * exp(-da * da / 0.0009)
                       + 0.15 * exp(-db * db / 0.0000045) + 0.05 * exp(-db * db / 0.0009);
          float ridge = 0.045 * exp(-pow((da - 0.0042) / 0.0022, 2.0)) + 0.045 * exp(-pow((db - 0.0042) / 0.0022, 2.0));
          diffuseColor.rgb *= (1.0 - valley * uAge) * (1.0 + ridge * uAge);
        }`
      )
      .replace(
        '#include <opaque_fragment>',
        `{
          // Daylight from the desk photograph, followed down the sun ray to the desk.
          vec3 g = vPaperWorld - uSunDir * (vPaperWorld.y / max(uSunDir.y, 0.2));
          vec4 pc = uProjector * vec4(g.x, 0.0, g.z, 1.0);
          vec2 luv = clamp(pc.xy / pc.w * 0.5 + 0.5, 0.0, 1.0);
          float lm = texture2D(uLightMap, luv).r * 2.0;
          outgoingLight *= mix(1.0, lm, uLightAmount);
          // A soft sheen where the sheet bends away from the eye.
          float facing = abs(dot(normalize(normal), normalize(vViewPosition)));
          outgoingLight += diffuseColor.rgb * pow(1.0 - facing, 4.0) * 0.12 * uAge;
        }
        #include <opaque_fragment>`
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        gl_FragColor.rgb = mix(gl_FragColor.rgb, linearToOutputTexel(vec4(diffuseColor.rgb, 1.0)).rgb, uUnlit);`
      );
  };
  material.customProgramCacheKey = () => 'paper-v2';
  return material;
}

/** 1×1 neutral light map for procedural mode (the window gobo lights the paper). */
export function neutralLightMap() {
  const tex = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
  tex.needsUpdate = true;
  return tex;
}
