# Prime Mover

Formerly HowWeMove (renamed 2026-11-25; the local folder and the model files' internal `howwemove` scene-extras key keep the old name). Interactive 3D exercise anatomy explorer: pick an exercise, and a realistic human model (skeleton plus 86 muscle ids) shows which muscles work, how hard, and how.

Proprietary, all rights reserved (see `LICENSE`). Not open source.

## Build order (stop and show the user after each step)

1. Asset research, architecture plan, data schema: done in `docs/01-research-and-plan.md`. The user chose asset option A (BodyParts3D, CC BY 4.0).
2. Viewer: done. Model, camera presets, studio light, layer and depth toggles, hover and click picking, muscle details, deep links `/muscle/:id`, mobile bottom sheet.
3. Exercises with role highlighting, the info panel, search and filters: done. 128 exercises (62 measured with EMG, 34 from related studies, 32 from anatomy); method and dataset licences in `docs/02-activation-evidence.md`.
4. ~~Movement animation~~: dropped by the user on 2026-11-25, because the static model shows the muscles worked well enough. The model has no rig; do not add one unless asked.
5. Next: 150+ exercises, then reverse lookup, compare mode, and the workout builder.
6. Polish: post-processing, transitions, mobile layout, performance (code-split three.js), accessibility.

Also built: male and female bodies (2026-11-25; the female body is the BodyParts3D male body warped to typical female proportions, since no open female model with individual muscles exists; the app and README say "proportions adjusted", keep that wording honest), and on 2026-11-26 original, light and dark themes, English and Serbian (Latinica, the user's choice; every exercise and muscle name translated, English names still searchable) and a reworked phone layout.

Check every step in the browser: no console errors, no horizontal scroll, works at 375px.

## Commands

- `npm install`
- `npm run dev`: Vite dev server on 5173 (`.claude/launch.json` config "dev")
- `npm run build`: `tsc -b` and the production build
- `npm run typecheck`: `tsc -b` (app, node and test projects)
- `npm test`: Vitest (`tests/**/*.test.ts`)
- `npm run lint`: ESLint
- `npm run model:map`: rebuilds `pipeline/mesh-map.csv` and `pipeline/mesh-map.md` from the BodyParts3D parts lists
- `npm run deploy`: `npm run build`, then `wrangler deploy` (Cloudflare Workers static assets from `dist/`, SPA fallback, headers in `public/_headers`). Live at https://prime-mover.milos300399.workers.dev. The old howwemove.milos300399.workers.dev address is a separate redirect Worker in `ops/old-url-redirect/` (`npm run deploy:redirect`). Wrangler is logged in on this machine.
- Repo: https://github.com/MiloshMilinkov/PrimeMover (public, view-only licence; vulnerability reporting, secret scanning with push protection, Dependabot alerts and a "Protect main" ruleset are on)
- `npm run model:build`: rebuilds `public/models/body-{high,low}.glb` (male) and `body-female-{high,low}.glb` (about 12 s)
- CI: `.github/workflows/ci.yml` calls the shared `node-ci.yml` in `MiloshMilinkov/.github` (the `typecheck`, `lint`, `test` and `build` scripts that exist, plus a gitleaks scan); check runs with `gh run list -L 3`. Its deploy job stays off until the repo has the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets and `DEPLOY_FROM_CI=true`; until then deploy with `npm run deploy`.

The model scripts need the BodyParts3D source data in `pipeline/.source/bp3d/` (git-ignored). Download it from https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html: `isa_BP3D_4.0_obj_99.zip`, unzipped into `isa_obj/`, plus `isa_element_parts.txt` and `isa_parts_list_e.txt`. The built GLBs are committed, so the app runs without it.

## Stack

Vite 8, React 19, TypeScript (strict), three r187 via React Three Fiber 9 and drei 10, Zustand 5, Tailwind 4, Framer Motion, React Router 8, Vitest. Pipeline: Node 24 scripts with meshoptimizer and gltf-transform (no Blender).

## Layout

- `pipeline/scripts/`: `build-mesh-map.mjs`, `build-model.mjs` (writes both bodies from one simplification, so they share slots, parts and fibres), `lib/female.mjs` (female proportions: a thin-plate-spline warp from 63 bone landmarks; tune the ratios at the top), `lib/geometry.mjs` (OBJ, weld, Taubin, simplify, trim, landmarks), `lib/mesh-map.mjs` (CSV reader, also used by tests), `lib/generated-muscles.mjs` (the six muscles BodyParts3D lacks)
- `public/models/`: built GLBs. Muscles mesh attributes: `_slot` (muscle id x side), `_fibre`. Skeleton: `_part`. Scene extras: `howwemove.slots` (`{id, side}`, or `{id: null, side, name, layer}` for unlisted muscles) and `howwemove.parts` (`{name, side}`).
- `src/data/`: `schema.ts` (types, `MUSCLE_IDS`), `muscles.ts` (registry: function, origin, insertion, layer), `sources.ts` (verified citations), `motions.ts` (motion ids), `exercises/*.ts` (one array per region; `helpers.ts` has `m`, `group`, `ja`, `lift`/`lower`/`hold`, `working`, and shared muscle and joint-action lists such as `VASTI`, `OBLIQUES`, `TRIPLE_EXTENSION`), registered in `exercises/index.ts`
- `src/three/`: `Scene` (on-demand frameloop), `Body` (materials, translucent pass, GPU picking), `CameraRig`, `camera.ts` (presets, FOV), `materials.ts` (muscle shader, state texture, pick decoding)
- `src/ui/`: `layout.ts` (`useInsetTracking` measures the panels for camera framing, `useWindowSize`, `SHEET_PEEK_BROWSE`/`SHEET_PEEK_DETAIL`), `breakpoints.ts`, `SettingsMenu` (theme, language, model detail). Phone layout: `BottomSheet` (dragged only from its header strip so lists scroll freely; `App` sends snap requests), `ListFrame` (one scroll area with a sticky search header in the sheet), `MobileViewControls` (floating layers button)
- `src/i18n/`: `index.ts` (`useT` gives `t`, `n` for plurals, `list`; `msg()` marks constant labels; Serbian is lazy-loaded before the first render), `sr/` (dictionaries: `ui.ts`, `muscles.ts`, `model.ts` for GLB part names, `exercises/*.ts`)
- `src/state/settings.ts`: theme and language (persisted as `pm.settings`; an inline script in `index.html` applies them before paint)
- `src/lib/slotState.ts`: per-slot RGBA state written to a DataTexture (role, tier, opacity, hover/selected)
- `src/state/viewer.ts` (Zustand; `quality` and `body` (male or female) persist to localStorage), `tests/`, `docs/`

## Rules

- Exercises are data, not code. Each one is typed against `src/data/schema.ts`.
- Activation is expressed as tiers (high/moderate/low) from kinesiology and EMG consensus. Never use made-up percentages. Put disagreements in `notes` and cite `sourceIds`.
- Every exercise sets `evidence` (`emg`, `related` or `anatomy`) honestly. Check a claim against the abstract (PubMed eutils) before citing it; every source must be cited at least once (tested).
- Optional cross-check: `FREE_EXERCISE_DB=path/to/exercises.json npx vitest run tests/crosscheck.test.ts` (free-exercise-db, never shipped). New flags get fixed or added to `ACCEPTED` with a reason.
- Muscle ids are side-less. `side` on an involvement is relative to the working limb.
- Role colours never rely on hue alone: use pattern, intensity and labels, and always show the legend.
- The UI is monochrome in every theme (tokens in `src/index.css`, `:root[data-theme=…]`); colour is reserved for muscle-role data.
- Every user-facing string goes through `t()` (or `msg()` for constants) with the English text as the key, and gets a Serbian entry in `src/i18n/sr/`. `tests/i18n.test.ts` fails on any missing one; `I18N_MISSING=out.txt npx vitest run tests/i18n.test.ts` writes the list. When one English word needs two Serbian words, use a context key (`'nav::Back'`; English shows the part after `::`). Serbian plurals have three forms joined by `|`. Latin names are set in Newsreader italic; everything else in Schibsted Grotesk.
- Footer disclaimer: "Educational only, not medical advice." Keep the BodyParts3D CC BY 4.0 credit visible (footer and README).
- Never ship Z-Anatomy or other share-alike or NC material into `public/models/`.

## Gotchas

- Vite's file watcher on this Windows machine sometimes misses a quick second write and serves a stale module (errors like "X is not defined" after a correct edit). `touch` the file or restart the dev server.
- Setup that mutates the `useGLTF`-cached scene must be idempotent: React StrictMode runs render code twice. See `prepareModel` in `Body.tsx`.
- The camera uses an off-centre view window to keep the body clear of the panels. `CameraRig` owns `aspect` and `fov` (`camera.manual = true`). Picking uses a pick matrix on whatever projection is current.
- The canvas renders on demand (`frameloop="demand"`). Anything that changes the image outside React props must call `invalidate()`.
- In the browser console during dev, `window.__r3f` (R3F state; use `.get()` for live values) and `window.__viewer` (Zustand store) help with checks.
- Changing theme or language, or hiding the page, can make the browser drop the canvas's last frame; `Redraw` in `Scene.tsx` asks for a new one, also when the page becomes visible again.
- The app root is `overflow-clip`, not `overflow-hidden`: a hidden-overflow box can still be scrolled by focus or `scrollIntoView`, which shifted the whole app up when something in the lowered sheet got focus.
- In Bash on this machine, heredocs and `node -e` mangle quotes and backslashes. For scripted multi-file edits, write a `.cjs` file to the scratchpad and run it with `node`.
- A depth pre-pass for x-ray did not work, so x-ray instead makes only the outermost shown layer translucent and hides the layers under it.
- BodyParts3D has no latissimus dorsi, rectus abdominis, internal oblique, transversus abdominis, quadratus lumborum or multifidus. They are generated from bone landmarks. The external oblique's aponeurosis is trimmed over the rectus.
- BodyParts3D OBJ headers still carry the old CC BY-SA 2.1 JP text. The licence page (2025-02-27) says CC BY 4.0.
- Muscle parts such as the trapezius parts sit only under the generic "organ zone" concept, so the mesh map trusts its explicit name list.
- Vitest still runs the body of a `describe.skipIf(...)` block to collect its tests, so guard any file reads inside it (see `tests/crosscheck.test.ts`).
