# HowWeMove

Interactive 3D exercise anatomy explorer: pick an exercise, and a realistic human model (skeleton plus 86 muscle ids) shows which muscles work, how hard, and how, phase by phase. Working title; the final name is TBD.

Proprietary, all rights reserved (see `LICENSE`). Not open source.

## Status

- Step 1 (research, architecture, schema) is done: `docs/01-research-and-plan.md`. The user chose asset option A (BodyParts3D, CC BY 4.0) with a skinned rig.
- Step 2 (viewer) is built: model, camera presets, studio light, layer and depth toggles, hover and click picking, muscle details, deep links `/muscle/:id`, mobile bottom sheet.
- Next is step 3 (30 researched exercises, role highlighting, info panel, search and filters).

## Build order (stop and show the user after each step)

1. Asset research, architecture plan, data schema
2. Viewer: model loaded, camera, lighting, layer toggles, hover and click muscles
3. 30 well-researched exercises with highlighting, the info panel, and search and filters
4. Movement animation with phase-based highlighting (skinned rig; motions as joint-angle data)
5. 150+ exercises, then reverse lookup, compare mode, and the workout builder
6. Polish: post-processing, transitions, mobile layout, performance (code-split three.js), accessibility

Check every step in the browser: no console errors, no horizontal scroll, works at 375px.

## Commands

- `npm install`
- `npm run dev`: Vite dev server on 5173 (`.claude/launch.json` config "dev")
- `npm run build`: `tsc -b` and the production build
- `npm run typecheck`: `tsc -b` (app, node and test projects)
- `npm test`: Vitest (`tests/**/*.test.ts`)
- `npm run lint`: ESLint
- `npm run model:map`: rebuilds `pipeline/mesh-map.csv` and `pipeline/mesh-map.md` from the BodyParts3D parts lists
- `npm run model:build`: rebuilds `public/models/body-{high,low}.glb` (about 6 s)

The model scripts need the BodyParts3D source data in `pipeline/.source/bp3d/` (git-ignored). Download it from https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html: `isa_BP3D_4.0_obj_99.zip`, unzipped into `isa_obj/`, plus `isa_element_parts.txt` and `isa_parts_list_e.txt`. The built GLBs are committed, so the app runs without it.

## Stack

Vite 8, React 19, TypeScript (strict), three r187 via React Three Fiber 9 and drei 10, Zustand 5, Tailwind 4, Framer Motion, React Router 8, Vitest. Pipeline: Node 24 scripts with meshoptimizer and gltf-transform (no Blender).

## Layout

- `pipeline/scripts/`: `build-mesh-map.mjs`, `build-model.mjs`, `lib/geometry.mjs` (OBJ, weld, Taubin, simplify), `lib/generated-muscles.mjs` (the six muscles BodyParts3D lacks), `debug-landmarks.mjs`
- `public/models/`: built GLBs. Muscles mesh attributes: `_slot` (muscle id x side), `_fibre`. Skeleton: `_part`. Scene extras: `howwemove.slots`, `howwemove.parts`.
- `src/data/`: `schema.ts` (types, `MUSCLE_IDS`), `muscles.ts` (registry: function, origin, insertion, layer)
- `src/three/`: `Scene`, `Body` (materials, translucent pass, GPU picking), `CameraRig`, `materials.ts` (muscle shader, state texture)
- `src/lib/slotState.ts`: per-slot RGBA state written to a DataTexture (role, tier, opacity, hover/selected)
- `src/state/viewer.ts`, `src/ui/`, `tests/`, `docs/`

## Rules

- Exercises are data, not code. Each one is typed against `src/data/schema.ts`.
- Activation is expressed as tiers (high/moderate/low) from kinesiology and EMG consensus. Never use made-up percentages. Put disagreements in `notes` and cite `sourceIds`.
- Muscle ids are side-less. `side` on an involvement is relative to the working limb.
- Role colours never rely on hue alone: use pattern, intensity and labels, and always show the legend.
- The UI is monochrome ivory on slate; colour is reserved for muscle-role data. Latin names are set in Newsreader italic; everything else in Schibsted Grotesk.
- Footer disclaimer: "Educational only, not medical advice." Keep the BodyParts3D CC BY 4.0 credit visible (footer and README).
- Never ship Z-Anatomy or other share-alike or NC material into `public/models/`.

## Gotchas

- Vite's file watcher on this Windows machine sometimes misses a quick second write and serves a stale module (errors like "X is not defined" after a correct edit). `touch` the file or restart the dev server.
- Setup that mutates the `useGLTF`-cached scene must be idempotent: React StrictMode runs render code twice. See `prepareModel` in `Body.tsx`.
- The camera uses an off-centre view window to keep the body clear of the panels. `CameraRig` owns `aspect` and `fov` (`camera.manual = true`), and picking composes its 1x1 view with that window.
- A depth pre-pass for x-ray did not work, so x-ray instead makes only the outermost shown layer translucent and hides the layers under it.
- BodyParts3D has no latissimus dorsi, rectus abdominis, internal oblique, transversus abdominis, quadratus lumborum or multifidus. They are generated from bone landmarks. The external oblique's aponeurosis is trimmed over the rectus.
- BodyParts3D OBJ headers still carry the old CC BY-SA 2.1 JP text. The licence page (2025-02-27) says CC BY 4.0.
- Muscle parts such as the trapezius parts sit only under the generic "organ zone" concept, so the mesh map trusts its explicit name list.
