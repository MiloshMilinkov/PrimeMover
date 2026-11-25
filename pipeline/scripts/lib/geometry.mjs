/*
 * HowWeMove
 * Copyright (c) 2026 Miloš Milinkov. All rights reserved.
 * Proprietary and confidential. See the LICENSE file.
 *
 * Small triangle-mesh toolkit for the asset pipeline. A mesh is
 * { positions: Float32Array (xyz), indices: Uint32Array }.
 */
import { MeshoptSimplifier } from 'meshoptimizer';

/** Parses a Wavefront OBJ (v + f only; faces are fan-triangulated). */
export function parseObj(text) {
  const pos = [];
  const idx = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('v ')) {
      const p = line.trim().split(/\s+/);
      pos.push(+p[1], +p[2], +p[3]);
    } else if (line.startsWith('f ')) {
      const f = line.trim().split(/\s+/).slice(1).map((t) => parseInt(t, 10) - 1);
      for (let i = 1; i + 1 < f.length; i++) idx.push(f[0], f[i], f[i + 1]);
    }
  }
  return { positions: new Float32Array(pos), indices: new Uint32Array(idx) };
}

/** Merges vertices that share a position, then drops unused vertices. */
export function weld(mesh) {
  const remap = MeshoptSimplifier.generatePositionRemap(mesh.positions, 3);
  const indices = mesh.indices.map((i) => remap[i]);
  return compact({ positions: mesh.positions, indices });
}

/** Removes vertices no triangle uses and renumbers indices. */
export function compact(mesh) {
  const map = new Int32Array(mesh.positions.length / 3).fill(-1);
  const out = [];
  let n = 0;
  const indices = new Uint32Array(mesh.indices.length);
  for (let i = 0; i < mesh.indices.length; i++) {
    const v = mesh.indices[i];
    if (map[v] < 0) {
      map[v] = n++;
      out.push(mesh.positions[v * 3], mesh.positions[v * 3 + 1], mesh.positions[v * 3 + 2]);
    }
    indices[i] = map[v];
  }
  return { positions: new Float32Array(out), indices };
}

/** Applies fn([x,y,z]) -> [x,y,z] to every vertex, returning a new mesh. */
export function mapPositions(mesh, fn) {
  const p = new Float32Array(mesh.positions.length);
  for (let i = 0; i < p.length; i += 3) {
    const [x, y, z] = fn([mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2]]);
    p[i] = x;
    p[i + 1] = y;
    p[i + 2] = z;
  }
  return { positions: p, indices: mesh.indices };
}

function neighbours(mesh) {
  const n = mesh.positions.length / 3;
  const sets = Array.from({ length: n }, () => new Set());
  const ix = mesh.indices;
  for (let i = 0; i < ix.length; i += 3) {
    const a = ix[i], b = ix[i + 1], c = ix[i + 2];
    sets[a].add(b).add(c);
    sets[b].add(a).add(c);
    sets[c].add(a).add(b);
  }
  return sets.map((s) => Uint32Array.from(s));
}

/** Taubin lambda/mu smoothing: removes scan lumpiness without shrinking the mesh. */
export function taubin(mesh, iterations = 4, lambda = 0.5, mu = -0.53) {
  if (iterations <= 0) return mesh;
  const nb = neighbours(mesh);
  let p = Float32Array.from(mesh.positions);
  const step = (factor) => {
    const q = new Float32Array(p.length);
    for (let v = 0; v < nb.length; v++) {
      const list = nb[v];
      let x = 0, y = 0, z = 0;
      for (const u of list) {
        x += p[u * 3];
        y += p[u * 3 + 1];
        z += p[u * 3 + 2];
      }
      const k = list.length || 1;
      q[v * 3] = p[v * 3] + factor * (x / k - p[v * 3]);
      q[v * 3 + 1] = p[v * 3 + 1] + factor * (y / k - p[v * 3 + 1]);
      q[v * 3 + 2] = p[v * 3 + 2] + factor * (z / k - p[v * 3 + 2]);
    }
    p = q;
  };
  for (let i = 0; i < iterations; i++) {
    step(lambda);
    step(mu);
  }
  return { positions: p, indices: mesh.indices };
}

/** Decimates to `ratio` of the triangles (at least minTris), within maxError (relative). */
export function simplify(mesh, ratio, minTris, maxError) {
  const tris = mesh.indices.length / 3;
  const target = Math.max(Math.min(tris, minTris), Math.round(tris * ratio)) * 3;
  if (target >= mesh.indices.length) return mesh;
  const [indices] = MeshoptSimplifier.simplify(mesh.indices, mesh.positions, 3, target, maxError, []);
  return compact({ positions: mesh.positions, indices });
}

/** Area-weighted smooth vertex normals. */
export function normals(mesh) {
  const p = mesh.positions;
  const ix = mesh.indices;
  const n = new Float32Array(p.length);
  for (let i = 0; i < ix.length; i += 3) {
    const a = ix[i] * 3, b = ix[i + 1] * 3, c = ix[i + 2] * 3;
    const e1x = p[b] - p[a], e1y = p[b + 1] - p[a + 1], e1z = p[b + 2] - p[a + 2];
    const e2x = p[c] - p[a], e2y = p[c + 1] - p[a + 1], e2z = p[c + 2] - p[a + 2];
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
    for (const v of [a, b, c]) {
      n[v] += nx;
      n[v + 1] += ny;
      n[v + 2] += nz;
    }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l;
    n[i + 1] /= l;
    n[i + 2] /= l;
  }
  return n;
}

/** Principal axis (unit vector) of a point cloud: the muscle's long axis. */
export function principalAxis(positions) {
  const n = positions.length / 3;
  let mx = 0, my = 0, mz = 0;
  for (let i = 0; i < positions.length; i += 3) {
    mx += positions[i];
    my += positions[i + 1];
    mz += positions[i + 2];
  }
  mx /= n;
  my /= n;
  mz /= n;
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i] - mx, y = positions[i + 1] - my, z = positions[i + 2] - mz;
    xx += x * x; xy += x * y; xz += x * z; yy += y * y; yz += y * z; zz += z * z;
  }
  let v = [0.3, 1, 0.2];
  for (let it = 0; it < 32; it++) {
    const w = [xx * v[0] + xy * v[1] + xz * v[2], xy * v[0] + yy * v[1] + yz * v[2], xz * v[0] + yz * v[1] + zz * v[2]];
    const l = Math.hypot(...w) || 1;
    v = w.map((c) => c / l);
  }
  // Point "down the limb" consistently so patterns flow the same way on both sides.
  if (v[1] > 0) v = v.map((c) => -c);
  return v;
}

/** Axis-aligned bounds of one or more position arrays. */
export function bounds(...positionArrays) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const positions of positionArrays) {
    for (let i = 0; i < positions.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], positions[i + k]);
        max[k] = Math.max(max[k], positions[i + k]);
      }
    }
  }
  return { min, max };
}

/** Keeps triangles whose centroid passes keep([x, y, z]). */
export function trim(mesh, keep) {
  const p = mesh.positions;
  const out = [];
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const a = mesh.indices[i] * 3, b = mesh.indices[i + 1] * 3, c = mesh.indices[i + 2] * 3;
    const centre = [0, 1, 2].map((k) => (p[a + k] + p[b + k] + p[c + k]) / 3);
    if (keep(centre)) out.push(mesh.indices[i], mesh.indices[i + 1], mesh.indices[i + 2]);
  }
  return compact({ positions: p, indices: new Uint32Array(out) });
}

/** The vertex furthest along `dir`. */
export function extreme(positions, dir) {
  let best = -Infinity;
  let point = null;
  for (let i = 0; i < positions.length; i += 3) {
    const v = positions[i] * dir[0] + positions[i + 1] * dir[1] + positions[i + 2] * dir[2];
    if (v > best) {
      best = v;
      point = [positions[i], positions[i + 1], positions[i + 2]];
    }
  }
  return point;
}

export function centroid(positions) {
  const c = [0, 0, 0];
  for (let i = 0; i < positions.length; i += 3) {
    c[0] += positions[i];
    c[1] += positions[i + 1];
    c[2] += positions[i + 2];
  }
  return c.map((v) => (v * 3) / positions.length);
}

/** Concatenates typed or plain number arrays into one typed array of `Type`. */
export function concat(chunks, Type) {
  const out = new Type(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}
