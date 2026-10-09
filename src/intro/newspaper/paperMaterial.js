import * as THREE from 'three';
import { SHEET } from './config.js';

/**
 * Paper material: MeshStandardMaterial with two additions
 *  - crease shading along both fold lines (fades out as the sheet flattens)
 *  - `uUnlit`: blends the lit result toward the raw printed colour. At 1 the
 *    paper shows exactly the pixels of its texture, which is what lets the
 *    final frame dissolve invisibly into the HTML page.
 */
export function createPaperMaterial({ map, side, uniforms }) {
  const material = new THREE.MeshStandardMaterial({
    map,
    side,
    roughness: 0.88,
    metalness: 0,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uUnlit = uniforms.uUnlit;
    shader.uniforms.uCreases = uniforms.uCreases;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uUnlit;
        uniform float uCreases;`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          float da = abs(vMapUv.x - 0.5) * ${SHEET.width.toFixed(3)};
          float db = abs(vMapUv.y - 0.5) * ${SHEET.height.toFixed(3)};
          float crease = 0.13 * exp(-da * da / 0.000016) + 0.045 * exp(-da * da / 0.0012)
                       + 0.13 * exp(-db * db / 0.000016) + 0.045 * exp(-db * db / 0.0012);
          diffuseColor.rgb *= 1.0 - crease * uCreases;
        }`
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        gl_FragColor.rgb = mix(gl_FragColor.rgb, linearToOutputTexel(vec4(diffuseColor.rgb, 1.0)).rgb, uUnlit);`
      );
  };
  material.customProgramCacheKey = () => 'paper-v1';
  return material;
}
