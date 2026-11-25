import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box3, Matrix4, Mesh, Scene, Sphere, Vector3, WebGLRenderTarget, type BufferGeometry, type Object3D } from 'three';
import type { MuscleId } from '../data/schema';
import { computeSlotState } from '../lib/slotState';
import { useViewer, type Hover, type ModelMeta, type Quality } from '../state/viewer';
import {
  createBoneMaterial,
  createBonePickMaterial,
  createMuscleMaterial,
  createMusclePickMaterial,
  createStateTexture,
  decodePick,
} from './materials';

const modelUrl = (quality: Quality) => `/models/body-${quality}.glb`;

/** World-space bounding sphere per muscle id, both sides together. */
function muscleSpheres(mesh: Mesh, meta: ModelMeta) {
  const geo = mesh.geometry as BufferGeometry;
  const pos = geo.getAttribute('position');
  const slot = geo.getAttribute('_slot');
  const boxes = new Map<MuscleId, Box3>();
  const v = new Vector3();
  mesh.updateWorldMatrix(true, false);
  for (let i = 0; i < pos.count; i++) {
    const id = meta.slots[slot.getX(i)]?.id;
    if (!id) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    let box = boxes.get(id);
    if (!box) boxes.set(id, (box = new Box3()));
    box.expandByPoint(v);
  }
  return new Map([...boxes].map(([id, box]) => [id, box.getBoundingSphere(new Sphere())]));
}

type Gltf = ReturnType<typeof useGLTF> & { scene: Object3D };
const prepared = new WeakMap<object, ReturnType<typeof prepare>>();

/**
 * Swaps in our materials and builds the translucent and picking meshes, once per
 * loaded GLB. Cached because it mutates the shared (useGLTF-cached) scene and React
 * may run render-phase code twice.
 */
function prepareModel(gltf: Gltf) {
  let model = prepared.get(gltf);
  if (!model) prepared.set(gltf, (model = prepare(gltf)));
  return model;
}

function prepare(gltf: Gltf) {
  const meta = gltf.scene.userData.howwemove as ModelMeta;
  const muscles = gltf.scene.getObjectByName('muscles') as Mesh;
  const skeleton = gltf.scene.getObjectByName('skeleton') as Mesh;
  const state = createStateTexture(meta.slots.length);

  muscles.material = createMuscleMaterial(state, 'opaque');
  skeleton.material = createBoneMaterial();

  // Translucent muscles (x-ray) draw after the opaque ones; clone() shares geometry and transform.
  const translucent = muscles.clone();
  translucent.name = 'muscles-translucent';
  translucent.material = createMuscleMaterial(state, 'translucent');
  translucent.renderOrder = 1;
  muscles.parent?.add(translucent);

  // Picking scene mirrors the visible meshes with id-encoding materials.
  const pickScene = new Scene();
  const pickMuscles = new Mesh(muscles.geometry, createMusclePickMaterial(state));
  const pickBones = new Mesh(skeleton.geometry, createBonePickMaterial());
  for (const m of [pickMuscles, pickBones]) {
    m.matrixAutoUpdate = false;
    m.matrixWorldAutoUpdate = false;
    pickScene.add(m);
  }
  return {
    meta,
    muscles,
    skeleton,
    translucent,
    state,
    stateBytes: state.image.data as Uint8Array,
    pickScene,
    pickMuscles,
    pickBones,
    pickTarget: new WebGLRenderTarget(1, 1),
  };
}

const hoverKey = (h: Hover) => (h === null ? '' : h.kind === 'muscle' ? `m${h.slot}` : `b${h.part}`);

export function Body() {
  const quality = useViewer((s) => s.quality);
  const gltf = useGLTF(modelUrl(quality)) as Gltf;
  const navigate = useNavigate();
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);
  const model = prepareModel(gltf);

  useEffect(() => {
    useViewer.getState().setMeta(model.meta, muscleSpheres(model.muscles, model.meta));
  }, [model]);

  // Rewrite the state texture whenever what is shown changes.
  const layerMode = useViewer((s) => s.layerMode);
  const depth = useViewer((s) => s.depth);
  const selected = useViewer((s) => s.selected);
  const hoverSlot = useViewer((s) => (s.hover?.kind === 'muscle' ? s.hover.slot : null));
  const preview = useViewer((s) => s.preview);
  useEffect(() => {
    const { anyTranslucent } = computeSlotState(
      { slots: model.meta.slots, layerMode, depth, hoverSlot, preview, selected },
      model.stateBytes,
    );
    model.state.needsUpdate = true;
    model.muscles.visible = layerMode !== 'skeleton';
    model.translucent.visible = anyTranslucent;
    model.skeleton.visible = layerMode !== 'muscles';
    model.pickMuscles.visible = model.muscles.visible;
    model.pickBones.visible = model.skeleton.visible;
    invalidate();
  }, [model, layerMode, depth, selected, hoverSlot, preview, invalidate]);

  /* ---------------- GPU picking ---------------- */
  useEffect(() => {
    const el = gl.domElement;
    const pixel = new Uint8Array(4);
    const pickMatrix = new Matrix4();
    const saved = new Matrix4();

    /** Renders the id scene for the pixel at (x, y), whatever the camera's projection is. */
    const renderPick = (x: number, y: number) => {
      const { camera, size } = get();
      model.pickMuscles.matrixWorld.copy(model.muscles.matrixWorld);
      model.pickBones.matrixWorld.copy(model.skeleton.matrixWorld);
      // Zoom the current projection onto that one pixel (the classic pick matrix).
      const cx = ((x + 0.5) / size.width) * 2 - 1;
      const cy = 1 - ((y + 0.5) / size.height) * 2;
      pickMatrix.set(size.width, 0, 0, -cx * size.width, 0, size.height, 0, -cy * size.height, 0, 0, 1, 0, 0, 0, 0, 1);
      saved.copy(camera.projectionMatrix);
      camera.projectionMatrix.premultiply(pickMatrix);
      const prevTarget = gl.getRenderTarget();
      const prevAlpha = gl.getClearAlpha();
      gl.setRenderTarget(model.pickTarget);
      gl.setClearAlpha(0);
      gl.clear();
      gl.render(model.pickScene, camera);
      gl.setRenderTarget(prevTarget);
      gl.setClearAlpha(prevAlpha);
      camera.projectionMatrix.copy(saved);
    };
    const idOf = () => pixel[0] + pixel[1] * 256;

    const setHover = (hover: Hover) => {
      const store = useViewer.getState();
      if (hoverKey(store.hover) === hoverKey(hover)) return;
      store.setHover(hover);
      el.style.cursor = hover?.kind === 'muscle' && model.meta.slots[hover.slot]?.id ? 'pointer' : '';
    };

    // Hover: at most one pick per animation frame, read back without stalling the GPU.
    let pointer = { x: 0, y: 0 };
    let lastPick = { x: -1e9, y: -1e9 };
    let scheduled = false;
    let inside = false;
    let seq = 0;
    const pickHover = async () => {
      scheduled = false;
      if (!inside || Math.hypot(pointer.x - lastPick.x, pointer.y - lastPick.y) < 2) return;
      lastPick = pointer;
      const mine = ++seq;
      renderPick(pointer.x, pointer.y);
      await gl.readRenderTargetPixelsAsync(model.pickTarget, 0, 0, 1, 1, pixel);
      if (mine === seq && inside) setHover(decodePick(idOf()));
    };

    let down: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      inside = true;
      pointer = { x: e.offsetX, y: e.offsetY };
      if (e.pointerType !== 'mouse' || e.buttons !== 0 || scheduled) return;
      scheduled = true;
      requestAnimationFrame(pickHover);
    };
    const onLeave = () => {
      inside = false;
      lastPick = { x: -1e9, y: -1e9 };
      setHover(null);
    };
    const onDown = (e: PointerEvent) => {
      down = e.button === 0 ? { x: e.offsetX, y: e.offsetY } : null;
    };
    const onUp = (e: PointerEvent) => {
      const start = down;
      down = null;
      if (!start || Math.hypot(e.offsetX - start.x, e.offsetY - start.y) > 6) return; // a drag
      renderPick(e.offsetX, e.offsetY);
      gl.readRenderTargetPixels(model.pickTarget, 0, 0, 1, 1, pixel);
      const picked = decodePick(idOf());
      if (picked === null) navigate('/');
      else if (picked.kind === 'muscle') {
        const id = model.meta.slots[picked.slot]?.id;
        if (id) navigate(`/muscle/${id}`);
      }
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
    };
  }, [gl, get, model, navigate]);

  return <primitive object={gltf.scene} />;
}
