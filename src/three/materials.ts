import {
  Color,
  DataTexture,
  MeshPhysicalMaterial,
  RGBAFormat,
  ShaderMaterial,
  UnsignedByteType,
  type IUniform,
} from 'three';
import { NEUTRAL_CODE, NEUTRAL_COLOR, ROLES, type RoleStyle } from '../data/roles';

/**
 * Per-slot muscle state, one RGBA8 texel per slot (slot = muscle id x side):
 *   R role code (0 none, 1 prime, 2 synergist, 3 stabilizer, 4 lengthening)
 *   G intensity (tier) 0..1
 *   B opacity: 0 hidden, (0,1) translucent pass, 1 opaque pass
 *   A interaction: 0 idle, ~0.5 hovered, 1 selected
 */
export function createStateTexture(slotCount: number) {
  const data = new Uint8Array(slotCount * 4);
  const tex = new DataTexture(data, slotCount, 1, RGBAFormat, UnsignedByteType);
  tex.needsUpdate = true;
  return tex;
}

const TISSUE = new Color('#8d2f2b');
/** Indexed by role code: 0 unused, ROLES in code order (1..n), then NEUTRAL_CODE. */
const ROLE_COLORS = [new Color(0), ...ROLES.map((r) => new Color(r.color)), new Color(NEUTRAL_COLOR)];
const ROLE_GLOW = [0, ...ROLES.map((r) => r.glow), 0];

/** GLSL for each legend pattern (1 = dark part), so the model and the legend share one table. */
const PATTERN_GLSL: Record<RoleStyle['pattern'], string> = {
  solid: '0.0',
  stripes: 'hwmStripe(dot(vBindPos, vec3(0.577)) * 55.0)',
  dots: 'hwmDots(vBindPos * 60.0)',
  bands: 'hwmStripe(dot(vBindPos, vFibreW) * 48.0)',
};
const PATTERN_BRANCHES = ROLES.map((r) => `if (hwmRole == ${r.code}) pattern = ${PATTERN_GLSL[r.pattern]};`).join('\n  ');

const VERTEX_DECL = /* glsl */ `
uniform float uPass;
attribute float _slot;
attribute vec3 _fibre;
uniform sampler2D uState;
varying vec4 vState;
varying vec3 vFibreW;
varying vec3 vBindPos;
`;

const VERTEX_BODY = /* glsl */ `
vState = texelFetch(uState, ivec2(int(_slot + 0.5), 0), 0);
vFibreW = normalize(mat3(modelMatrix) * _fibre);
vBindPos = (modelMatrix * vec4(position, 1.0)).xyz;
`;

/**
 * Drops triangles that belong to the other pass (or are hidden) before rasterising:
 * every triangle sits inside one slot, so moving its vertices outside the clip
 * volume culls it whole. This keeps discard out of the fragment shader.
 */
const VERTEX_CULL = /* glsl */ `
#include <project_vertex>
{
  float a = vState.b;
  bool keep = uPass < 0.5 ? a >= 0.996 : (a >= 0.004 && a < 0.996);
  if (!keep) gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
}
`;

const FRAGMENT_DECL = /* glsl */ `
uniform float uPass;
uniform vec3 uRoleColor[${NEUTRAL_CODE + 1}];
uniform float uRoleGlow[${NEUTRAL_CODE + 1}];
varying vec4 vState;
varying vec3 vFibreW;
varying vec3 vBindPos;

// Anti-aliased pattern helpers (1 = dark part of the pattern). They fade out when
// the pattern would be smaller than a few pixels.
float hwmStripe(float s) {
  float w = fwidth(s);
  float f = abs(fract(s) - 0.5) * 2.0;
  return smoothstep(0.5 - w, 0.5 + w, f) * (1.0 - smoothstep(0.3, 0.8, w));
}
float hwmDots(vec3 p) {
  vec3 c = fract(p) - 0.5;
  float d = length(c);
  float w = fwidth(d) * 1.5;
  float scale = length(fwidth(p));
  return (1.0 - smoothstep(0.26 - w, 0.26 + w, d)) * (1.0 - smoothstep(0.3, 0.8, scale));
}
`;

const FRAGMENT_COLOR = /* glsl */ `
float hwmAlpha = vState.b;
float hwmFlag = vState.a;
float hwmHover = step(0.25, hwmFlag) * (1.0 - step(0.75, hwmFlag));
float hwmSelected = step(0.75, hwmFlag);
int hwmRole = int(vState.r * 255.0 + 0.5);
float hwmLevel = vState.g;
vec3 hwmBase = diffuse;
if (hwmRole == ${NEUTRAL_CODE}) {
  hwmBase = uRoleColor[${NEUTRAL_CODE}];
} else if (hwmRole > 0) {
  hwmBase = mix(diffuse * 0.6, uRoleColor[hwmRole], 0.4 + 0.6 * hwmLevel);
  // Role patterns in object space, so they stay put as the camera orbits.
  float pattern = 0.0;
  ${PATTERN_BRANCHES}
  hwmBase *= 1.0 - 0.4 * pattern;
}
hwmBase = mix(hwmBase, hwmBase * 1.4 + 0.05, hwmHover);
hwmBase = mix(hwmBase, hwmBase * 1.25 + vec3(0.1, 0.08, 0.06), hwmSelected);
vec4 diffuseColor = vec4(hwmBase, opacity);
`;

/** Fine striations across the fibre direction, faded out before they alias. */
const FRAGMENT_NORMAL = /* glsl */ `
#include <normal_fragment_maps>
{
  vec3 nW = inverseTransformDirection(normal, viewMatrix);
  vec3 t = vFibreW - dot(vFibreW, nW) * nW;
  float tl = length(t);
  if (tl > 1e-3) {
    t /= tl;
    vec3 b = cross(nW, t);
    float g = dot(vBindPos, b) * 1100.0 + 2.2 * sin(dot(vBindPos, t) * 38.0);
    float fade = 1.0 - smoothstep(0.7, 1.8, fwidth(g));
    vec3 bV = normalize((viewMatrix * vec4(b, 0.0)).xyz);
    normal = normalize(normal + bV * cos(g) * 0.18 * fade);
  }
}
float hwmFres = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.0);
if (uPass > 0.5) diffuseColor.a = hwmAlpha * mix(0.18, 1.0, hwmFres);
`;

const FRAGMENT_EMISSIVE = /* glsl */ `
#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(0.93, 0.9, 0.85) * (hwmSelected * (0.06 + hwmFres * 1.6) + hwmHover * (0.02 + hwmFres * 0.5));
// Working muscles glow a little in their role colour; prime movers most.
totalEmissiveRadiance += uRoleColor[hwmRole] * uRoleGlow[hwmRole] * hwmLevel * (0.6 + 0.4 * hwmFres);
`;

/** PBR muscle tissue. `pass` splits opaque and translucent muscles into two draws. */
export function createMuscleMaterial(state: DataTexture, pass: 'opaque' | 'translucent') {
  const material = new MeshPhysicalMaterial({
    color: TISSUE,
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.34,
    sheen: 0.7,
    sheenColor: new Color('#ff8e7e'),
    sheenRoughness: 0.45,
    transparent: pass === 'translucent',
    depthWrite: pass === 'opaque',
  });
  const uniforms: Record<string, IUniform> = {
    uState: { value: state },
    uPass: { value: pass === 'opaque' ? 0 : 1 },
    uRoleColor: { value: ROLE_COLORS },
    uRoleGlow: { value: ROLE_GLOW },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_DECL}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERTEX_BODY}`)
      .replace('#include <project_vertex>', VERTEX_CULL);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_DECL}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', FRAGMENT_COLOR)
      .replace('#include <normal_fragment_maps>', FRAGMENT_NORMAL)
      .replace('#include <emissivemap_fragment>', FRAGMENT_EMISSIVE);
  };
  material.customProgramCacheKey = () => `hwm-muscle-${pass}`;
  return material;
}

export function createBoneMaterial() {
  return new MeshPhysicalMaterial({
    color: new Color('#e4d9c6'),
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.5,
    sheen: 0.25,
    sheenColor: new Color('#fff3df'),
  });
}

/** Encodes an id (1..65535) as RG bytes for GPU picking. 0 means nothing. */
const PICK_FRAGMENT = /* glsl */ `
varying float vId;
varying float vAlpha;
void main() {
  if (vAlpha < 0.004) discard;
  int id = int(vId + 0.5);
  gl_FragColor = vec4(float(id & 255) / 255.0, float((id >> 8) & 255) / 255.0, 0.0, 1.0);
}
`;

export const PICK_BONE_BASE = 2048;

export type Picked = { kind: 'muscle'; slot: number } | { kind: 'bone'; part: number } | null;

/** Turns a decoded pick id back into what was under the pointer. */
export const decodePick = (id: number): Picked =>
  id === 0 ? null : id < PICK_BONE_BASE ? { kind: 'muscle', slot: id - 1 } : { kind: 'bone', part: id - PICK_BONE_BASE };

export function createMusclePickMaterial(state: DataTexture) {
  return new ShaderMaterial({
    uniforms: { uState: { value: state } },
    vertexShader: /* glsl */ `
      attribute float _slot;
      uniform sampler2D uState;
      varying float vId;
      varying float vAlpha;
      void main() {
        vAlpha = texelFetch(uState, ivec2(int(_slot + 0.5), 0), 0).b;
        vId = _slot + 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: PICK_FRAGMENT,
    toneMapped: false,
  });
}

export function createBonePickMaterial() {
  return new ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute float _part;
      varying float vId;
      varying float vAlpha;
      void main() {
        vAlpha = 1.0;
        vId = _part + ${PICK_BONE_BASE.toFixed(1)};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: PICK_FRAGMENT,
    toneMapped: false,
  });
}
