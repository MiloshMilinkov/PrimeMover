import type { Sphere } from 'three';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { framingIds } from '../data/exercises';
import type { Exercise, MuscleId, MuscleLayer } from '../data/schema';
import { DESKTOP_QUERY } from '../ui/breakpoints';

export type LayerMode = 'full' | 'skeleton' | 'muscles' | 'xray';
/** 0 = all muscles, 1 = hide the outer layer, 2 = deep muscles only. */
export type Depth = 0 | 1 | 2;
export type ViewPreset = 'front' | 'back' | 'side';
export type Quality = 'high' | 'low';
export type ModelSide = 'left' | 'right' | 'center';

export interface ModelSlot {
  id: MuscleId | null;
  side: ModelSide;
  /** For unlisted BodyParts3D muscles (no app id): name without side, and layer. */
  name?: string;
  layer?: MuscleLayer;
}

export interface ModelPart {
  name: string;
  side: ModelSide;
}

export interface ModelMeta {
  version: number;
  height: number;
  slots: ModelSlot[];
  parts: ModelPart[];
  credit: string;
}

/** What the pointer is over on the model. The tooltip tracks the pointer position itself. */
export type Hover = { kind: 'muscle'; slot: number } | { kind: 'bone'; part: number } | null;

/** Screen space (px) the panels cover on each edge; the camera frames the body in the rest. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ViewerState {
  layerMode: LayerMode;
  depth: Depth;
  quality: Quality;
  /** Requested camera preset; `nonce` re-triggers the same preset. */
  view: { preset: ViewPreset; nonce: number };
  hover: Hover;
  /** Muscle highlighted from a list (hover or keyboard focus), not from the model. */
  preview: MuscleId | null;
  selected: MuscleId | null;
  meta: ModelMeta | null;
  /** World-space bounding sphere of each muscle (both sides), filled on model load. */
  spheres: Map<MuscleId, Sphere> | null;
  /**
   * Camera framing request: fit these muscles, optionally from a preset side, with
   * `pad` times their radius around them. `nonce` re-triggers the same request.
   */
  framing: { ids: MuscleId[]; preset?: ViewPreset; pad: number; nonce: number } | null;
  /** Active exercise id (from the route), or null when browsing muscles. */
  exercise: string | null;
  insets: Insets;
  setLayerMode: (m: LayerMode) => void;
  setDepth: (d: Depth) => void;
  setQuality: (q: Quality) => void;
  goTo: (preset: ViewPreset) => void;
  setHover: (h: Hover) => void;
  setPreview: (id: MuscleId | null) => void;
  setSelected: (id: MuscleId | null) => void;
  setMeta: (meta: ModelMeta, spheres: Map<MuscleId, Sphere>) => void;
  frame: (ids: MuscleId[], preset?: ViewPreset, pad?: number) => void;
  /** Frames an exercise's working muscles (with more context than a single muscle). */
  frameExercise: (exercise: Exercise) => void;
  setExercise: (id: string | null) => void;
  setInsets: (insets: Insets) => void;
}

const prefersLow = () =>
  typeof window !== 'undefined' &&
  (!window.matchMedia(DESKTOP_QUERY).matches || (navigator.hardwareConcurrency ?? 8) <= 4);

export const useViewer = create<ViewerState>()(
  persist(
    (set, get) => ({
      layerMode: 'full',
      depth: 0,
      quality: prefersLow() ? 'low' : 'high',
      view: { preset: 'front', nonce: 0 },
      hover: null,
      preview: null,
      selected: null,
      meta: null,
      spheres: null,
      framing: null,
      exercise: null,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      setLayerMode: (layerMode) => set({ layerMode }),
      setDepth: (depth) => set({ depth }),
      setQuality: (quality) => set({ quality }),
      goTo: (preset) => set((s) => ({ view: { preset, nonce: s.view.nonce + 1 } })),
      setHover: (hover) => set({ hover }),
      setPreview: (preview) => set({ preview }),
      setSelected: (selected) => set({ selected }),
      setMeta: (meta, spheres) => set({ meta, spheres }),
      frame: (ids, preset, pad = 1.35) => set((s) => ({ framing: { ids, preset, pad, nonce: (s.framing?.nonce ?? 0) + 1 } })),
      frameExercise: (exercise) => get().frame(framingIds(exercise), exercise.camera?.preset, 1.5),
      setExercise: (exercise) => set({ exercise }),
      setInsets: (insets) =>
        set((s) => {
          const same = (Object.keys(insets) as (keyof Insets)[]).every((k) => Math.abs(s.insets[k] - insets[k]) < 1);
          return same ? s : { insets };
        }),
    }),
    {
      name: 'hwm.viewer',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ quality: s.quality }),
    },
  ),
);
