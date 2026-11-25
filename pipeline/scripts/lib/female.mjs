/*
 * Prime Mover
 * Copyright (c) 2026 Miloš Milinkov. All rights reserved.
 * Proprietary and confidential. See the LICENSE file.
 *
 * Female proportions for the BodyParts3D (male) body: a landmark-driven warp.
 *
 * BodyParts3D has one male body. There is no open, CC BY female model with a full
 * skeleton and individual muscles, so the female body is this one reshaped. Bone
 * landmarks (hip crests, hip joints, shoulders, elbows, knees, skull...) are moved to
 * typical female positions, and a 3D thin-plate spline carries every vertex of every
 * bone and muscle with them, so muscles stay attached to their bones.
 *
 * Proportions (female relative to male, after scaling to stature) follow the usual
 * anthropometric differences: shorter stature, wider and lower pelvis with a wider
 * outlet, wider hip joints (so a larger Q angle at the knee), narrower shoulders, a
 * smaller rib cage, a larger carrying angle at the elbow and a smaller skull. It is an
 * approximation of typical proportions, not a scan of a female body.
 *
 * Coordinates are the app's: metres, Y up from the floor, X = subject's left, Z = front.
 */
import { centroid, extreme, norm, SIDES } from './geometry.mjs';

/** Female stature relative to male (about 163 cm vs 176 cm). Applied to every axis. */
const STATURE = 0.93;

/** Extra changes on top of the stature scale, per landmark group. */
const PELVIS_CREST_WIDTH = 1.1; // bi-iliac breadth
const HIP_JOINT_WIDTH = 1.08; // distance between the hip joints and trochanters
const PELVIC_OUTLET_WIDTH = 1.16; // between the ischial tuberosities
const PELVIS_HEIGHT = 0.93; // iliac crest to hip joint: a lower, flatter pelvis
const SHOULDER_WIDTH = 0.92; // acromion to acromion
const RIBCAGE_WIDTH = 0.95;
const CARRYING_ANGLE_SHIFT = 0.012; // m outward at the wrist, from the larger carrying angle
const SKULL = 0.95; // skull size about its own centre

/** Ribs whose lateral-most points pin the rib cage width (upper, middle, lower). */
const RIB_LANDMARKS = ['third', 'sixth', 'ninth'];

/** The point scaled to female stature, with X then scaled by `kx` about the midline and moved by `dx`. */
const scaled = ([x, y, z], kx = 1, dx = 0) => [x * STATURE * kx + dx, y * STATURE, z * STATURE];

/**
 * Landmark pairs: [male position, female position].
 * `meshes` maps BodyParts3D concept names to meshes already in app coordinates.
 */
function landmarks(meshes) {
  const need = (name) => {
    const m = meshes.get(name);
    if (!m) throw new Error(`female warp: missing landmark mesh "${name}"`);
    return m.positions;
  };
  const at = (name, dir) => extreme(need(name), norm(dir));
  const pairs = [];
  /** Pins a male landmark to its female position (by default just scaled to stature). */
  const pin = (male, female = scaled(male)) => pairs.push([male, female]);

  /* ---------- midline: spine, sacrum, skull ---------- */
  for (const v of ['axis', 'fourth cervical vertebra', 'first thoracic vertebra', 'sixth thoracic vertebra', 'twelfth thoracic vertebra', 'third lumbar vertebra', 'fifth lumbar vertebra']) {
    pin(centroid(need(v)));
  }
  pin(at('sacrum', [0, 1, 0.3]));
  pin(at('sacrum', [0, -1, 0]));

  const skullPoints = [
    at('frontal bone', [0, 1, 0]),
    at('frontal bone', [0, 0.2, 1]),
    at('occipital bone', [0, 0, -1]),
    at('mandible', [0, -0.4, 1]),
    at('left parietal bone', [1, 0.3, 0]),
    at('right parietal bone', [-1, 0.3, 0]),
    at('mandible', [1, -1, -0.6]),
    at('mandible', [-1, -1, -0.6]),
  ];
  const skullCentre = centroid(skullPoints.flat());
  const skullCentreF = scaled(skullCentre);
  for (const p of skullPoints) pin(p, skullCentreF.map((c, i) => c + (p[i] - skullCentre[i]) * STATURE * SKULL));

  /* ---------- each side ---------- */
  for (const { side, s } of SIDES) {
    const L = (name) => `${side} ${name}`;

    // Pelvis: wider at the crests, hip joints and outlet; the crest sits lower over the hip joint.
    const hipJoint = at(L('femur'), [-s, 1, 0]); // femoral head: medial and up
    const hipJointF = scaled(hipJoint, HIP_JOINT_WIDTH);
    pin(hipJoint, hipJointF);
    const trochanter = at(L('femur'), [s, 0.6, 0]);
    pin(trochanter, scaled(trochanter, HIP_JOINT_WIDTH));
    // Iliac crest, its front (ASIS) and its back: wider, and lower over the hip joint.
    for (const dir of [[s, 1, 0], [0.3 * s, 0.3, 1], [0.2 * s, 0.6, -1]]) {
      const p = at(L('hip bone'), dir);
      const q = scaled(p, PELVIS_CREST_WIDTH);
      q[1] = hipJointF[1] + (p[1] - hipJoint[1]) * STATURE * PELVIS_HEIGHT;
      pin(p, q);
    }
    const ischium = at(L('hip bone'), [0.2 * s, -1, -0.4]);
    pin(ischium, scaled(ischium, PELVIC_OUTLET_WIDTH));
    pin(at(L('hip bone'), [-s, 0, 0.4])); // pubic symphysis

    // Legs: knees and ankles stay at the stature-scaled width, so wider hips give a larger Q angle.
    pin(centroid(need(L('patella'))));
    pin(at(L('femur'), [0, -1, 0]));
    pin(centroid(need(L('talus'))));
    pin(at(L('calcaneus'), [0, -1, -1]));
    pin(at(`distal phalanx of ${side} big toe`, [0, 0, 1]));

    // Shoulders and rib cage: narrower.
    const acromion = at(L('scapula'), [s, 1, 0.3]);
    pin(acromion, scaled(acromion, SHOULDER_WIDTH));
    const humeralHead = at(L('humerus'), [0, 1, 0]);
    const humeralHeadF = scaled(humeralHead, SHOULDER_WIDTH);
    pin(humeralHead, humeralHeadF);
    const scapulaLow = at(L('scapula'), [0, -1, -0.3]);
    pin(scapulaLow, scaled(scapulaLow, (SHOULDER_WIDTH + RIBCAGE_WIDTH) / 2));
    const clavicleOut = at(L('clavicle'), [s, 0, 0]);
    pin(clavicleOut, scaled(clavicleOut, SHOULDER_WIDTH));
    pin(at(L('clavicle'), [-s, 0, 0]));
    for (const rib of RIB_LANDMARKS) {
      const lateral = at(L(`${rib} rib`), [s, 0, 0]);
      pin(lateral, scaled(lateral, RIBCAGE_WIDTH));
    }

    // Arms follow the shoulder in; the forearm angles out a little more (carrying angle).
    const shift = humeralHeadF[0] - scaled(humeralHead)[0];
    const elbow = at(L('humerus'), [0, -1, 0]);
    pin(elbow, scaled(elbow, 1, shift));
    const wrist = at(L('radius'), [0, -1, 0]);
    pin(wrist, scaled(wrist, 1, shift + s * CARRYING_ANGLE_SHIFT));
    const fingertip = at(`distal phalanx of ${side} middle finger`, [0, -1, 0]);
    pin(fingertip, scaled(fingertip, 1, shift + s * CARRYING_ANGLE_SHIFT * 1.3));
  }
  return pairs;
}

/** Solves A X = B for several right-hand sides at once (Gaussian elimination, partial pivoting). */
function solve(A, B) {
  const n = A.length;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [B[c], B[p]] = [B[p], B[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      if (!f) continue;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      for (let k = 0; k < B[r].length; k++) B[r][k] -= f * B[c][k];
    }
  }
  const X = B.map((row) => row.map(() => 0));
  for (let r = n - 1; r >= 0; r--) {
    for (let k = 0; k < B[r].length; k++) {
      let v = B[r][k];
      for (let j = r + 1; j < n; j++) v -= A[r][j] * X[j][k];
      X[r][k] = v / A[r][r];
    }
  }
  return X;
}

/**
 * Builds the warp from the male body's meshes: a thin-plate spline (kernel U(r) = r)
 * through the landmark pairs. `warp(positions)` returns the female copy of an xyz
 * positions array.
 */
export function femaleWarp(meshes) {
  const pairs = landmarks(meshes);
  const n = pairs.length;
  const src = pairs.map(([male]) => male);
  const A = Array.from({ length: n + 4 }, () => new Array(n + 4).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) A[i][j] = Math.hypot(src[i][0] - src[j][0], src[i][1] - src[j][1], src[i][2] - src[j][2]);
    const row = [1, ...src[i]];
    for (let k = 0; k < 4; k++) A[i][n + k] = A[n + k][i] = row[k];
  }
  const C = solve(A, [...pairs.map(([, female]) => [...female]), [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]);
  const [a0, ax, ay, az] = C.slice(n);
  const column = (rows, k) => Float64Array.from(rows, (r) => r[k]);
  const [sx, sy, sz] = [0, 1, 2].map((k) => column(src, k));
  const [cx, cy, cz] = [0, 1, 2].map((k) => column(C.slice(0, n), k));

  const warp = (positions) => {
    const out = new Float32Array(positions.length);
    for (let o = 0; o < positions.length; o += 3) {
      const x = positions[o];
      const y = positions[o + 1];
      const z = positions[o + 2];
      let vx = a0[0] + ax[0] * x + ay[0] * y + az[0] * z;
      let vy = a0[1] + ax[1] * x + ay[1] * y + az[1] * z;
      let vz = a0[2] + ax[2] * x + ay[2] * y + az[2] * z;
      for (let i = 0; i < n; i++) {
        const dx = x - sx[i];
        const dy = y - sy[i];
        const dz = z - sz[i];
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
        vx += cx[i] * r;
        vy += cy[i] * r;
        vz += cz[i] * r;
      }
      out[o] = vx;
      out[o + 1] = vy;
      out[o + 2] = vz;
    }
    return out;
  };
  return { warp, landmarks: n };
}
