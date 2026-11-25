/*
 * Prime Mover
 * Copyright (c) 2026 Miloš Milinkov. All rights reserved.
 * Proprietary and confidential. See the LICENSE file.
 *
 * Builds the muscles BodyParts3D lacks: latissimus dorsi, rectus abdominis,
 * internal oblique, transversus abdominis, quadratus lumborum and multifidus.
 * Shapes are anchored to landmarks measured on the BodyParts3D bones and wrapped
 * onto the surrounding anatomy, so they move with the model if it is rebuilt.
 *
 * App space: metres, +Y up, +Z anterior, +X is the subject's left.
 */
import { centroid, extreme, trim } from './geometry.mjs';

const SIDES = [
  { side: 'left', s: 1 },
  { side: 'right', s: -1 },
];

/* ---------------- small vector helpers ---------------- */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(a, 1 / (len(a) || 1));
const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/** Catmull-Rom through control points, sampled at t in [0,1]. */
function spline(points, t) {
  const n = points.length - 1;
  const f = clamp01(t) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const u = f - i;
  const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(n, i + 2)];
  const u2 = u * u, u3 = u2 * u;
  return [0, 1, 2].map(
    (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3),
  );
}

/* ---------------- ray casting against a set of meshes ---------------- */
/** Triangle soup binned by height, for near-horizontal rays. */
function buildShell(meshes, bin = 0.01) {
  const tris = [];
  for (const m of meshes) {
    if (!m) continue;
    const p = m.positions;
    for (let i = 0; i < m.indices.length; i += 3) {
      const a = m.indices[i] * 3, b = m.indices[i + 1] * 3, c = m.indices[i + 2] * 3;
      tris.push([p[a], p[a + 1], p[a + 2], p[b], p[b + 1], p[b + 2], p[c], p[c + 1], p[c + 2]]);
    }
  }
  const bins = new Map();
  for (const t of tris) {
    const lo = Math.floor(Math.min(t[1], t[4], t[7]) / bin);
    const hi = Math.floor(Math.max(t[1], t[4], t[7]) / bin);
    for (let k = lo; k <= hi; k++) (bins.get(k) ?? bins.set(k, []).get(k)).push(t);
  }
  return { bins, bin };
}

/** Distance to the farthest surface crossed by a horizontal ray (outer skin of the shell). */
function farthestHit(shell, origin, dir) {
  const list = shell.bins.get(Math.floor(origin[1] / shell.bin));
  if (!list) return null;
  let best = null;
  for (const t of list) {
    const e1 = [t[3] - t[0], t[4] - t[1], t[5] - t[2]];
    const e2 = [t[6] - t[0], t[7] - t[1], t[8] - t[2]];
    const h = cross(dir, e2);
    const a = dot(e1, h);
    if (Math.abs(a) < 1e-12) continue;
    const f = 1 / a;
    const sv = [origin[0] - t[0], origin[1] - t[1], origin[2] - t[2]];
    const u = f * dot(sv, h);
    if (u < 0 || u > 1) continue;
    const q = cross(sv, e1);
    const v = f * dot(dir, q);
    if (v < 0 || u + v > 1) continue;
    const d = f * dot(e2, q);
    if (d > 0 && (best === null || d > best)) best = d;
  }
  return best;
}

/* ---------------- mesh builders ---------------- */
/**
 * Closed slab from a grid of inner-surface points: outer = inner + normal * thickness.
 * grid[i][j], i along u (nu), j along v (nv). thickness(i, j) in metres.
 * `outwardHint(p)` returns a vector pointing away from the body at p.
 */
function slab(grid, thickness, outwardHint) {
  const nu = grid.length;
  const nv = grid[0].length;
  const normals = grid.map((row, i) =>
    row.map((p, j) => {
      const du = sub(grid[Math.min(nu - 1, i + 1)][j], grid[Math.max(0, i - 1)][j]);
      const dv = sub(grid[i][Math.min(nv - 1, j + 1)], grid[i][Math.max(0, j - 1)]);
      let n = norm(cross(du, dv));
      if (dot(n, outwardHint(p)) < 0) n = mul(n, -1);
      return n;
    }),
  );
  const pos = [];
  const idx = [];
  const inner = (i, j) => i * nv + j;
  const outer = (i, j) => nu * nv + i * nv + j;
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) pos.push(...grid[i][j]);
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) pos.push(...add(grid[i][j], mul(normals[i][j], thickness(i, j))));
  const quad = (a, b, c, d) => idx.push(a, b, c, a, c, d);
  for (let i = 0; i < nu - 1; i++)
    for (let j = 0; j < nv - 1; j++) {
      quad(outer(i, j), outer(i + 1, j), outer(i + 1, j + 1), outer(i, j + 1));
      quad(inner(i, j), inner(i, j + 1), inner(i + 1, j + 1), inner(i + 1, j));
    }
  for (let i = 0; i < nu - 1; i++) {
    quad(inner(i, 0), inner(i + 1, 0), outer(i + 1, 0), outer(i, 0));
    quad(outer(i, nv - 1), outer(i + 1, nv - 1), inner(i + 1, nv - 1), inner(i, nv - 1));
  }
  for (let j = 0; j < nv - 1; j++) {
    quad(outer(0, j), outer(0, j + 1), inner(0, j + 1), inner(0, j));
    quad(inner(nu - 1, j), inner(nu - 1, j + 1), outer(nu - 1, j + 1), outer(nu - 1, j));
  }
  return orientOutward({ positions: new Float32Array(pos), indices: new Uint32Array(idx) });
}

/** Flips the whole mesh if most triangles face inward (signed volume < 0). */
function orientOutward(mesh) {
  const p = mesh.positions;
  const ix = mesh.indices;
  let vol = 0;
  for (let i = 0; i < ix.length; i += 3) {
    const a = [p[ix[i] * 3], p[ix[i] * 3 + 1], p[ix[i] * 3 + 2]];
    const b = [p[ix[i + 1] * 3], p[ix[i + 1] * 3 + 1], p[ix[i + 1] * 3 + 2]];
    const c = [p[ix[i + 2] * 3], p[ix[i + 2] * 3 + 1], p[ix[i + 2] * 3 + 2]];
    vol += dot(a, cross(b, c));
  }
  if (vol < 0) for (let i = 0; i < ix.length; i += 3) [ix[i + 1], ix[i + 2]] = [ix[i + 2], ix[i + 1]];
  return mesh;
}

/** Closed tube through `centres` with elliptical sections (rx along X, rz along Z). */
function tube(centres, rx, rz, segments = 14) {
  const pos = [];
  const idx = [];
  const n = centres.length;
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < segments; k++) {
      const a = (k / segments) * Math.PI * 2;
      pos.push(centres[i][0] + Math.cos(a) * rx[i], centres[i][1], centres[i][2] + Math.sin(a) * rz[i]);
    }
  }
  for (let i = 0; i < n - 1; i++)
    for (let k = 0; k < segments; k++) {
      const a = i * segments + k, b = i * segments + ((k + 1) % segments);
      const c = (i + 1) * segments + ((k + 1) % segments), d = (i + 1) * segments + k;
      idx.push(a, b, c, a, c, d);
    }
  const capA = pos.length / 3;
  pos.push(...centres[0]);
  const capB = pos.length / 3;
  pos.push(...centres[n - 1]);
  for (let k = 0; k < segments; k++) {
    idx.push(capA, (k + 1) % segments, k);
    idx.push(capB, (n - 1) * segments + k, (n - 1) * segments + ((k + 1) % segments));
  }
  return orientOutward({ positions: new Float32Array(pos), indices: new Uint32Array(idx) });
}

/** Laplacian smoothing of a grid in place, keeping the border fixed. */
function smoothGrid(grid, iterations) {
  for (let it = 0; it < iterations; it++) {
    const copy = grid.map((row) => row.map((p) => [...p]));
    for (let i = 1; i < grid.length - 1; i++)
      for (let j = 1; j < grid[0].length - 1; j++) {
        const avg = mul(add(add(copy[i - 1][j], copy[i + 1][j]), add(copy[i][j - 1], copy[i][j + 1])), 0.25);
        grid[i][j] = lerp(copy[i][j], avg, 0.5);
      }
  }
}

/** Moves every vertex horizontally toward the body axis by `d` metres. */
function shrinkTowardAxis(mesh, d, axisZ) {
  const p = Float32Array.from(mesh.positions);
  for (let i = 0; i < p.length; i += 3) {
    const dir = norm([-p[i], 0, axisZ - p[i + 2]]);
    p[i] += dir[0] * d;
    p[i + 2] += dir[2] * d;
  }
  return { positions: p, indices: mesh.indices };
}

/* ---------------- the muscles ---------------- */
const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

/**
 * @param {Map<string, {positions: Float32Array, indices: Uint32Array}>} meshes  app-space meshes by BodyParts3D concept name
 * @returns {{ muscles: {appId: string, side: string, mesh: object, fibre: (p: number[]) => number[]}[],
 *             replacements: {concept: string, mesh: object}[] }}
 */
export function generateMuscles(meshes) {
  const need = (name) => {
    const m = meshes.get(name);
    if (!m) throw new Error(`generated muscles: missing landmark mesh "${name}"`);
    return m;
  };
  const vertebra = (name) => {
    const mesh = need(name);
    return { mesh, c: centroid(mesh.positions), tip: extreme(mesh.positions, [0, 0, -1]) };
  };
  const lumbar = ORDINAL.slice(0, 5).map((o) => vertebra(`${o} lumbar vertebra`));
  const thoracic = ORDINAL.map((o) => vertebra(`${o} thoracic vertebra`));
  const cervical = [vertebra('axis'), ...ORDINAL.slice(2, 7).map((o) => vertebra(`${o} cervical vertebra`))];
  const sacrum = need('sacrum').positions;
  // Horizontal "body axis" used to wrap sheets and orient tangents: just in front of L3.
  const axisZ = lumbar[2].c[2] + 0.01;

  const muscles = [];
  const replacements = [];

  for (const { side, s } of SIDES) {
    const L = (name) => need(`${side} ${name}`);
    const X = (x) => s * x;

    /* ---------- rectus abdominis ---------- */
    const eo = L('external oblique');
    const hip = L('hip bone').positions;
    const pubis = extreme(hip, [-s, 0, 0.4]); // pubic symphysis region
    const cartilage7 = L('seventh costal cartilage').positions;
    const xiphoidY = extreme(cartilage7, [0, 1, 0])[1];
    const raBottom = pubis[1] + 0.012;
    const raTop = xiphoidY - 0.012;
    const raMedial = (t) => 0.0018 + 0.0022 * t; // t: 0 bottom -> 1 top
    const raLateral = (t) => 0.034 + 0.066 * Math.pow(t, 0.7);
    /** True over the rectus footprint on the front of the abdomen. */
    const overRectus = ([x, y, z]) =>
      z > 0 && y > raBottom - 0.01 && y < raTop + 0.02 && Math.abs(x) < raLateral(clamp01((y - raBottom) / (raTop - raBottom))) + 0.006;
    // Front surface of the abdominal wall, read from the external oblique aponeurosis.
    const front = (x, y) => {
      let best = -Infinity;
      const p = eo.positions;
      for (let i = 0; i < p.length; i += 3) {
        if (Math.abs(p[i] - X(x)) < 0.012 && Math.abs(p[i + 1] - y) < 0.012 && p[i + 2] > best) best = p[i + 2];
      }
      return best > -Infinity ? best : null;
    };
    const fallbackFront = extreme(cartilage7, [0, 0, 1])[2] - 0.015;
    const RA_U = 12, RA_V = 72;
    const intersections = [0.47, 0.66, 0.84]; // tendinous intersections (t along length)
    const raGrid = [];
    for (let i = 0; i < RA_U; i++) {
      const row = [];
      const w = i / (RA_U - 1);
      for (let j = 0; j < RA_V; j++) {
        const t = j / (RA_V - 1);
        const y = raBottom + (raTop - raBottom) * t;
        const x = raMedial(t) + (raLateral(t) - raMedial(t)) * w;
        row.push([X(x), y, (front(x, y) ?? front(0.02, y) ?? fallbackFront) - 0.002]);
      }
      raGrid.push(row);
    }
    smoothGrid(raGrid, 2);
    const raThickness = (i, j) => {
      const t = j / (RA_V - 1);
      const w = i / (RA_U - 1);
      const edge = Math.sin(Math.PI * clamp01(w * 0.92 + 0.04)); // rounded borders
      const groove = intersections.reduce((g, c) => Math.min(g, smooth(clamp01(Math.abs(t - c) / 0.042))), 1);
      return (0.003 + 0.011 * edge) * (0.62 + 0.38 * groove);
    };
    // The slab grows outward (forward) from the old aponeurosis surface.
    muscles.push({ appId: 'rectus-abdominis', side, mesh: slab(raGrid, raThickness, () => [0, 0, 1]), fibre: () => [0, 1, 0] });

    // Cut the external oblique's aponeurosis over the rectus so the rectus shows.
    const eoLateral = trim(eo, (p) => !overRectus(p));
    replacements.push({ concept: `${side} external oblique`, mesh: eoLateral });

    /* ---------- internal oblique and transversus abdominis ---------- */
    const horizontalTangent = (p) => norm(cross([0, 1, 0], norm([p[0], 0, p[2] - axisZ])));
    const wallBottom = pubis[1] + 0.03;
    const io = trim(shrinkTowardAxis(eoLateral, 0.011, axisZ), ([, y]) => y > wallBottom && y < thoracic[11].c[1]);
    muscles.push({
      appId: 'internal-oblique',
      side,
      mesh: io,
      fibre: (p) => {
        const t = horizontalTangent(p);
        const forward = t[2] * Math.sign(p[0] || 1) >= 0 ? t : mul(t, -1);
        return norm(add([0, 0.75, 0], mul(forward, 0.65)));
      },
    });
    const tva = trim(shrinkTowardAxis(eoLateral, 0.021, axisZ), ([, y]) => y > wallBottom && y < xiphoidY - 0.06);
    muscles.push({ appId: 'transversus-abdominis', side, mesh: tva, fibre: horizontalTangent });

    /* ---------- quadratus lumborum ---------- */
    const tipsUp = lumbar.slice(0, 4).map((v) => extreme(v.mesh.positions, [s, 0, 0])).reverse(); // L4 -> L1
    const crest = extreme(hip, [s * 0.2, 1, -0.6]);
    const qlTop = lumbar[0].c[1] + 0.011;
    const QL_U = 8, QL_V = 16;
    const qlGrid = [];
    for (let i = 0; i < QL_U; i++) {
      const w = i / (QL_U - 1); // medial -> lateral
      const row = [];
      for (let j = 0; j < QL_V; j++) {
        const t = j / (QL_V - 1); // bottom -> top
        const tp = spline(tipsUp, t);
        const yBottom = crest[1] - 0.025 + 0.012 * w;
        const y = yBottom + (qlTop - 0.035 * w - yBottom) * t;
        const medial = Math.abs(tp[0]) + 0.004;
        const lateral = 0.082 + 0.012 * (1 - t);
        row.push([X(medial + (lateral - medial) * w), y, tp[2] - 0.004]);
      }
      qlGrid.push(row);
    }
    const dome = (i, n) => Math.sin(Math.PI * (0.06 + 0.88 * (i / (n - 1))));
    const qlMesh = slab(qlGrid, (i, j) => 0.006 + 0.012 * dome(i, QL_U) * dome(j, QL_V), () => [0, 0, -1]);
    muscles.push({ appId: 'quadratus-lumborum', side, mesh: qlMesh, fibre: () => [0, 1, 0] });

    /* ---------- multifidus ---------- */
    const sacTip = extreme(sacrum, [0, 0.35, -1]);
    const level = (v, dz, r) => ({ y: (v.c[1] + v.tip[1]) / 2, z: v.tip[2] + dz, r });
    const spine = [
      { y: sacTip[1] - 0.03, z: sacTip[2] + 0.004, r: 0.011 },
      ...[...lumbar].reverse().map((v, k) => level(v, 0.014, [0.016, 0.016, 0.015, 0.013, 0.011][k])),
      ...[...thoracic].reverse().map((v, k) => level(v, 0.011, 0.009 - 0.003 * (k / 11))),
      ...[...cervical].reverse().map((v) => level(v, 0.01, 0.0055)),
    ];
    const ctrl = spine.map((p) => [0, p.y, p.z]);
    const radii = spine.map((p) => [p.r, 0, 0]);
    const samples = 60;
    const centres = [];
    const rx = [];
    const rz = [];
    for (let k = 0; k < samples; k++) {
      const t = k / (samples - 1);
      const c = spline(ctrl, t);
      const r = spline(radii, t)[0];
      const taper = Math.min(1, smooth(clamp01(t / 0.05)) * 0.6 + 0.4) * Math.min(1, smooth(clamp01((1 - t) / 0.05)) * 0.6 + 0.4);
      centres.push([X(0.006 + r * 0.95), c[1], c[2]]);
      rx.push(r * 0.85 * taper);
      rz.push(r * 0.75 * taper);
    }
    muscles.push({ appId: 'multifidus', side, mesh: tube(centres, rx, rz), fibre: () => [0, 1, 0] });

    /* ---------- latissimus dorsi ---------- */
    const humerus = L('humerus').positions;
    const humTop = extreme(humerus, [0, 1, 0])[1];
    const groove = (() => {
      // Intertubercular groove: most anterior humerus point 5-7.5 cm below the top of the head.
      let best = null;
      for (let i = 0; i < humerus.length; i += 3) {
        const y = humerus[i + 1];
        if (y < humTop - 0.075 || y > humTop - 0.05) continue;
        if (!best || humerus[i + 2] > best[2]) best = [humerus[i], y, humerus[i + 2]];
      }
      return add(best, [-s * 0.006, 0, -0.004]);
    })();
    const tmLow = extreme(L('teres major').positions, [s * 0.4, -1, -0.3]);
    const t7 = thoracic[6].tip;
    const t10 = thoracic[9].tip;
    const t12 = thoracic[11].tip;
    const l3 = lumbar[2].tip;
    const ilio = extreme(L('iliocostalis lumborum').positions, [s, 0, -0.3]);
    const ribTip = extreme(L('tenth rib').positions, [s, 0, 0]);
    const origin = [
      [0, t7[1] + 0.004, t7[2] - 0.012],
      [0, t10[1], t10[2] - 0.016],
      [X(0.018), t12[1], t12[2] - 0.03],
      [X(0.05), l3[1], l3[2] - 0.042],
      [X(Math.abs(ilio[0]) - 0.005), crest[1] - 0.012, crest[2] - 0.02],
      [X(Math.abs(crest[0]) + 0.02), crest[1] + 0.01, crest[2] + 0.025],
      [X(Math.abs(ribTip[0]) + 0.01), ribTip[1] - 0.02, ribTip[2] - 0.03],
      [X(Math.abs(ribTip[0]) + 0.012), ribTip[1] + 0.04, ribTip[2] - 0.025],
    ];
    const gate = add(tmLow, [s * 0.012, -0.012, -0.012]); // posterior axillary fold, below teres major
    const insertTop = add(groove, [0, 0.012, 0]);
    const insertBottom = add(groove, [0, -0.012, 0]);
    const shell = buildShell(
      [
        ...ORDINAL.map((o) => meshes.get(`${side} ${o} rib`)),
        ...thoracic.map((v) => v.mesh),
        ...lumbar.map((v) => v.mesh),
        ...['iliocostalis lumborum', 'iliocostalis thoracis', 'longissimus thoracis', 'spinalis thoracis', 'serratus posterior inferior', 'serratus anterior', 'teres major', 'scapula', 'rhomboid major', 'infraspinatus muscle', 'hip bone'].map((n) => meshes.get(`${side} ${n}`)),
        eo,
      ],
      0.008,
    );
    const LAT_U = 26, LAT_V = 22;
    const latGrid = [];
    const wrapLimit = 0.7; // fraction of the way to the arm where the sheet leaves the trunk
    for (let i = 0; i < LAT_U; i++) {
      const u = i / (LAT_U - 1);
      const o = spline(origin, u);
      const ins = lerp(insertTop, insertBottom, u);
      const g = add(gate, [0, (0.5 - u) * 0.03, 0]);
      const row = [];
      for (let j = 0; j < LAT_V; j++) {
        const v = j / (LAT_V - 1);
        // Origin -> axillary gate, then gate -> insertion.
        let p = v < 0.78 ? lerp(o, g, smooth(v / 0.78) * 0.15 + (v / 0.78) * 0.85) : lerp(g, ins, (v - 0.78) / 0.22);
        if (v < wrapLimit + 0.15) {
          const axis = [0, p[1], axisZ + 0.008];
          const dir = norm([p[0] - axis[0], 0, p[2] - axis[2]]);
          const hit = farthestHit(shell, axis, dir);
          if (hit !== null) {
            // Fully wrapped onto the trunk, then easing off as the sheet heads for the arm.
            const k = 1 - smooth(clamp01((v - wrapLimit) / 0.15));
            p = lerp(p, add(axis, mul(dir, hit + 0.0025)), k);
          }
        }
        row.push(p);
      }
      latGrid.push(row);
    }
    smoothGrid(latGrid, 3);
    const latThickness = (i, j) => {
      const v = j / (LAT_V - 1);
      const u = i / (LAT_U - 1);
      const body = 0.003 + 0.007 * smooth(clamp01((v - 0.05) / 0.4)); // thin aponeurotic origin
      const bundle = v > 0.6 ? 0.008 * Math.sin(Math.PI * clamp01((v - 0.6) / 0.35)) : 0; // thick axillary fold
      const edge = Math.sin(Math.PI * (0.05 + 0.9 * u));
      const tendon = v > 0.94 ? 0.5 : 1;
      return (body + bundle) * (0.5 + 0.5 * edge) * tendon;
    };
    const latMesh = slab(latGrid, latThickness, (p) => norm([p[0], 0, p[2] - axisZ]));
    muscles.push({ appId: 'latissimus-dorsi', side, mesh: latMesh, fibre: (p) => norm(sub(groove, p)) });
  }

  return { muscles, replacements };
}
