import type { Sphere } from 'three';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MuscleId, MuscleLayer } from '../data/schema';
import { DESKTOP_QUERY } from '../ui/breakpoints';

export type LayerMode = 'full' | 'skeleton' | 'muscles' | 'xray';
/** 0 = all muscles, 1 = hide the outer layer, 2 = deep muscles only. */
export type Depth = 0 | 1 | 2;
export type ViewPreset = 'front' | 'back' | 'side';
export type Quality = 'high' | 'low';
export type Side = 'left' | 'right' | 'center';

export interface ModelSlot {
  id: MuscleId | null;
  side: Side;
  /** For unlisted BodyParts3D muscles (no app id): name without side, and layer. */
  name?: string;
  layer?: MuscleLayer;
}

export interface ModelPart {
  name: string;
  side: Side;
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
  /** Camera framing request for a muscle; `nonce` re-triggers the same one. */
  focus: { id: MuscleId; nonce: number } | null;
  insets: Insets;
  setLayerMode: (m: LayerMode) => void;
  setDepth: (d: Depth) => void;
  setQuality: (q: Quality) => void;
  goTo: (preset: ViewPreset) => void;
  setHover: (h: Hover) => void;
  setPreview: (id: MuscleId | null) => void;
  setSelected: (id: MuscleId | null) => void;
  setMeta: (meta: ModelMeta, spheres: Map<MuscleId, Sphere>) => void;
  focusMuscle: (id: MuscleId) => void;
  setInsets: (insets: Insets) => void;
}

const prefersLow = () =>
  typeof window !== 'undefined' &&
  (!window.matchMedia(DESKTOP_QUERY).matches || (navigator.hardwareConcurrency ?? 8) <= 4);

export const useViewer = create<ViewerState>()(
  persist(
    (set) => ({
      layerMode: 'full',
      depth: 0,
      quality: prefersLow() ? 'low' : 'high',
      view: { preset: 'front', nonce: 0 },
      hover: null,
      preview: null,
      selected: null,
      meta: null,
      spheres: null,
      focus: null,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      setLayerMode: (layerMode) => set({ layerMode }),
      setDepth: (depth) => set({ depth }),
      setQuality: (quality) => set({ quality }),
      goTo: (preset) => set((s) => ({ view: { preset, nonce: s.view.nonce + 1 } })),
      setHover: (hover) => set({ hover }),
      setPreview: (preview) => set({ preview }),
      setSelected: (selected) => set({ selected }),
      setMeta: (meta, spheres) => set({ meta, spheres }),
      focusMuscle: (id) => set((s) => ({ focus: { id, nonce: (s.focus?.nonce ?? 0) + 1 } })),
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
