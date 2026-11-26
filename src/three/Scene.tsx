import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { memo, Suspense, useEffect } from 'react';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { useSettings } from '../state/settings';
import { useViewer } from '../state/viewer';
import { Body } from './Body';
import { BASE_FOV, PRESETS } from './camera';
import { CameraRig } from './CameraRig';

/**
 * Soft studio light built from light cards, so no HDRI file has to load. A module
 * constant, so re-renders never hand <Environment> new children (which re-bakes it).
 */
const STUDIO = (
  <Environment resolution={256} frames={1}>
    <Lightformer form="rect" intensity={2.4} color="#fff3e6" position={[0, 5, 3]} rotation-x={-Math.PI / 3} scale={[7, 3, 1]} />
    <Lightformer form="rect" intensity={1.6} color="#cfe1ff" position={[-5, 2, -2]} rotation-y={Math.PI / 2.4} scale={[4, 7, 1]} />
    <Lightformer form="rect" intensity={1.3} color="#ffe2cf" position={[5, 2.5, -3]} rotation-y={-Math.PI / 2.4} scale={[3, 7, 1]} />
    <Lightformer form="ring" intensity={0.5} color="#ffffff" position={[0, 0.5, 5]} scale={4} />
  </Environment>
);

/**
 * The browser can drop the canvas's last frame when the page is restyled (theme,
 * language) or hidden (the phone switched apps, the tab went to the background). With
 * on-demand rendering nothing would draw the body again, so ask for a frame.
 */
function Redraw() {
  const invalidate = useThree((s) => s.invalidate);
  const theme = useSettings((s) => s.theme);
  const lang = useSettings((s) => s.lang);
  useEffect(() => {
    // Twice: once now, once after the browser has applied the new styles.
    invalidate();
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [theme, lang, invalidate]);
  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState === 'visible') invalidate();
    };
    document.addEventListener('visibilitychange', onShow);
    window.addEventListener('pageshow', onShow);
    return () => {
      document.removeEventListener('visibilitychange', onShow);
      window.removeEventListener('pageshow', onShow);
    };
  }, [invalidate]);
  return null;
}

/** Renders on demand: camera moves, hover and state changes call invalidate(). */
export const Scene = memo(function Scene() {
  const quality = useViewer((s) => s.quality);
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop="demand"
      dpr={quality === 'high' ? [1, 2] : [1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: BASE_FOV, near: 0.05, far: 40, position: PRESETS.front }}
      onCreated={(state) => {
        // Handy for checks in the browser console during development.
        if (import.meta.env.DEV) Object.assign(window, { __r3f: state, __viewer: useViewer });
        state.gl.toneMapping = ACESFilmicToneMapping;
        state.gl.toneMappingExposure = 1.05;
        state.gl.outputColorSpace = SRGBColorSpace;
      }}
    >
      {STUDIO}
      <directionalLight position={[2.5, 4, 3]} intensity={1.1} color="#fff6ec" />
      <directionalLight position={[-3, 2, -4]} intensity={0.7} color="#bcd4ff" />
      <Suspense fallback={null}>
        <Body />
        <ContactShadows position={[0, 0.001, 0]} scale={2.6} blur={2.6} far={1.4} opacity={0.6} resolution={512} frames={1} color="#000000" />
      </Suspense>
      <CameraRig />
      <Redraw />
    </Canvas>
  );
});
