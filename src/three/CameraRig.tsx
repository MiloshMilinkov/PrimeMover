import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { PerspectiveCamera } from 'three';
import { useViewer } from '../state/viewer';
import { REDUCED_MOTION_QUERY } from '../ui/breakpoints';
import { useMediaQuery } from '../ui/layout';
import { BASE_FOV, PRESETS, TARGET_Y } from './camera';

export function CameraRig() {
  const ref = useRef<CameraControls>(null);
  const camera = useThree((s) => s.camera) as PerspectiveCamera & { manual?: boolean };
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const view = useViewer((s) => s.view);
  const focus = useViewer((s) => s.focus);
  const spheres = useViewer((s) => s.spheres);
  const insets = useViewer((s) => s.insets);
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    const [x, y, z] = PRESETS[view.preset];
    ref.current?.setLookAt(x, y, z, 0, TARGET_Y, 0, view.nonce > 0 && !reduceMotion);
  }, [view, reduceMotion]);

  useEffect(() => {
    const sphere = focus && spheres?.get(focus.id);
    if (!sphere) return;
    const padded = sphere.clone();
    padded.radius = Math.max(sphere.radius * 1.35, 0.12);
    ref.current?.fitToSphere(padded, !reduceMotion);
  }, [focus, spheres, reduceMotion]);

  // Keep the body centred in the space the panels leave free, at any zoom: the
  // camera describes a larger frame and the canvas shows an off-centre window of it.
  // R3F must not reset the aspect on resize, so the rig owns aspect and fov.
  useEffect(() => {
    camera.manual = true;
    const W = size.width;
    const H = size.height;
    const sx = Math.round((insets.left + (W - insets.right)) / 2 - W / 2);
    const sy = Math.round((insets.top + (H - insets.bottom)) / 2 - H / 2);
    const fullW = W + 2 * Math.abs(sx);
    const fullH = H + 2 * Math.abs(sy);
    camera.aspect = fullW / fullH;
    camera.fov = (2 * Math.atan(Math.tan((BASE_FOV * Math.PI) / 360) * (fullH / H)) * 180) / Math.PI;
    if (sx === 0 && sy === 0) camera.clearViewOffset();
    else camera.setViewOffset(fullW, fullH, Math.abs(sx) - sx, Math.abs(sy) - sy, W, H);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, insets, size.width, size.height, invalidate]);

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={0.35}
      maxDistance={8}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      smoothTime={0.35}
      draggingSmoothTime={0.08}
    />
  );
}
