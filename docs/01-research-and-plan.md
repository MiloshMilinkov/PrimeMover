# HowWeMove: step 1 research and plan

Working title: **HowWeMove** (the folder name). Change it any time.

**Decision (2026-11-25):** option A (BodyParts3D, CC BY 4.0) with the skinned rig. The mesh-name mapping table is `pipeline/mesh-map.md`, generated with `pipeline/mesh-map.csv`.

---

## 1. Decisions I need from you

1. **3D asset:** option A, B or C below. I recommend **A**.
2. **Animation approach:** skinned rig or segment-based FK. I recommend the **skinned rig**, as described in section 4.
3. Later, not blocking: the final product name and where to host it (the hosting needs SPA rewrites for `/exercise/...` deep links).

---

## 2. Asset research

The brief asks for a skeleton plus 80+ separate, named muscles, including deep ones: gluteus minimus, vastus intermedius, all four rotator cuff muscles, and the core layers. The project is proprietary, so the licence matters as much as the mesh.

### Comparison

| | **A. BodyParts3D** (DBCLS, Japan) | **B. Z-Anatomy** | **C. "Muscle Anatomy – Ecorché Rigged Set"** (A. Lashko, Superhive / Blender Market) |
|---|---|---|---|
| Licence | **CC BY 4.0** (licence page updated 2025-02-27). Commercial use and modification allowed. **No share-alike.** Credit line required. | **CC BY-SA 4.0**. Anything derived from it must be released under the same licence. | Royalty-free marketplace licence. $99 Standard covers only **one** commercial work, capped at 2,000 sales or 20,000 monthly views. **$499 Extended** has no cap. No attribution needed. |
| Proprietary-project flag | Low. You need a visible credit. The README and the OBJ headers still carry the old CC BY-SA 2.1 JP text, so get a one-line written confirmation from DBCLS/NBDC. | **High.** Our processed GLB (with rig and weights) would have to be published as CC BY-SA, so anyone could legally extract and reuse it. The code and exercise data can stay proprietary (they are separate works), but get a lawyer's view. Its NC-licensed parts (inner ear, kidney) must be left out. | Medium. The listing doesn't say whether a glTF shipped to the browser (and so extractable) is allowed. Get the seller's written OK before buying. |
| Meshes | 2,234 OBJ meshes for the whole body, all systems, each keyed by an FMA id. **Muscles split exactly as the brief needs** (checked against the official parts lists): deltoid clavicular, acromial and spinal parts; pec major clavicular, sternocostal and abdominal parts; glute max, med and min; all 4 quads; biceps femoris long and short heads, semitendinosus, semimembranosus; supraspinatus, infraspinatus, teres minor, subscapularis; all 3 triceps heads; trapezius by part; iliocostalis, longissimus and spinalis; individual forearm muscles. | Built on BodyParts3D, then cleaned and extended into a full atlas. Named structures (Terminologia Anatomica). Still updated daily (last commit 2026-11-24). Probably fills A's gaps, but that can only be checked once downloaded. | "Every bone and muscle are separate objects", "each … named". Says "all the major muscles", but no list. As an écorché it is **probably missing deep muscles** (glute min, vastus intermedius, subscapularis, transversus). Ask the seller for the list. |
| **Gaps** | **Missing: latissimus dorsi, rectus abdominis, internal oblique, transversus abdominis, quadratus lumborum, multifidus.** All six were checked against both official lists. They are big ones for an exercise app (lats and abs), so we must model them. | Likely none for our list (to verify). | Deep layer likely incomplete (to verify). |
| Polygons | Not published. Only the 99% polygon reduction is offered: 136 MB zipped OBJ (IS-A tree). I'll measure the muscle and bone subset in step 2 and decimate it to our budget. Mesh is MRI-derived and a little lumpy. | Not published. Blender template is 86.7 MB zipped. Measured after download. | **136,692 tris** (muscles 73,046, skeleton 63,464). Web-ready as-is. |
| Rigged | No. | No (an atlas; no rig mentioned in any source). | **Yes.** Blender rig with IK/FK; muscles deform with the rig, and v1.3 improved the adductor, sartorius and TFL deformation. |
| UVs / textures | None. Fine, because we shade procedurally. | Not stated. | UVs plus three 8K colour textures. No normal maps. |
| Format / tools | OBJ, millimetres, Z-up. **No Blender needed**: the whole pipeline can run in Node. | Blender application template. Needs Blender to export. | `.blend` only. Needs Blender to export. |
| Cost | Free. | Free. | $499 (Extended). |

### Also evaluated and not recommended

- **TurboSquid** rigged full-anatomy packs ("Complete Male Anatomy", "Male Full Anatomy Rigged", $249–$1,999; the male/female complete pack lists about 101,700 polys for the male muscular system). The TurboSquid Royalty Free License says products "must be contained in proprietary formats" and forbids "any other open format". It names approved WebGL exports from Unity, Unreal, Lumberyard and Stingray only, and others need written approval case by case. **A glTF served to a three.js app is not covered without written approval** or a corporate licence. (TurboSquid blocked automated reading of the product pages, so the per-product specs above come from search snippets.)
- **CGTrader** packs (e.g. a $121 muscular system plus skeleton, about 108,869 polys; a $40 "Male Muscular System" with separated, named muscles). The Royalty Free License requires "all commercially reasonable measures" to stop end users getting at the model: a proprietary format or encryption. Plain glTF in a browser likely fails that, so we'd need an obfuscation layer and an arguable reading of the terms.
- **Sketchfab Store:** it is closed. Products can be viewed but not bought, and paid models moved to **Fab** (Epic). Fab's summary allows commercial use "incorporated into" a project and bans "standalone" redistribution, but the binding EULA text (which I couldn't retrieve) and a forum question about web apps leave browser extraction **unanswered**. Any Fab model would need written confirmation from Fab support.
- **Zygote** (the industry-standard medical anatomy, used by Google Body / Zygote Body). Sales are by contact only, with custom licences and no public prices; expect thousands of USD. It is the premium fallback if A's look isn't good enough.

### Recommendation: A (BodyParts3D, CC BY 4.0)

It is the **only option that is both licence-clean for a proprietary app and has the deep muscles the brief asks for**, split by head. Plan for its weak spots:

1. **The six missing muscles** (lats, rectus abdominis, internal oblique, transversus abdominis, quadratus lumborum, multifidus). I'll generate them as lofted, smoothed surfaces anchored to real attachment landmarks on the BodyParts3D bones (for example, the lats from T7–L5, the iliac crest and the lower ribs to the humerus's intertubercular groove). That unblocks everything. If they look procedural next to the scanned muscles, commission an artist for those six (roughly 1–3 days of work).
2. **Surface quality:** Taubin smoothing, decimation with meshoptimizer, and a shader that adds procedural fibre striation along each muscle's long axis. That replaces normal maps, since the meshes have no UVs.
3. **Credit:** an "About & credits" panel plus a footer link: "BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International", with changes noted.

**If you want the fastest premium look and accept the risk:** C, but only after the seller confirms the deep-muscle list and browser use in writing. If you're fine with the model itself being open: B.

---

## 3. Mapping table (after you choose)

Once the asset is fixed, I'll write `pipeline/mesh-map.csv`: source mesh name / FMA id, then side, then app muscle id (from `MUSCLE_IDS` in `src/data/schema.ts`). One app id can map to several meshes; for example, `deep-hip-rotators` covers the obturators, gemelli and quadratus femoris. With A, the FMA ids are already in the official parts lists, so most of the table can be generated and then checked by hand.

---

## 4. Animation: two approaches

### Option 1: skinned / rigged mesh (recommended)

One armature with about 60 deform bones: spine (5), neck (2), head, **clavicle and scapula** (needed for retraction, protraction, elevation and upward rotation in rows, presses and shrugs), humerus, a forearm with a **twist bone** for pronation and supination, hand, pelvis, femur, tibia, foot and toes.

- **Bones** are skinned 100% to one joint, so they move rigidly. In practice they behave like FK segments.
- **Muscles** are skinned to the 2–3 joints they cross. Weights come from each vertex's position along the muscle's origin→insertion axis (a smooth ramp from the proximal bone to the distal one), not from automatic heat maps. Because the weights are computed, the whole pipeline can run in Node with no Blender for option A.
- **How crossing muscles deform:** linear blend skinning stretches the biceps between shoulder and forearm, and the quads and patellar tendon between pelvis and tibia, with no tearing. Its known flaws are volume loss at deep flexion (elbow, knee, hip) and "candy-wrapper" twisting at the forearm. Fixes:
  - twist and helper bones for the forearm and upper arm;
  - per-joint **volume preservation in the vertex shader**: push vertices out along the normal by joint angle × a falloff near the joint;
  - a **contraction bulge** on muscles that are shortening under load (thicker belly, scaled by tier), done in the same shader. No morph targets are needed. This is also what makes prime movers visibly "work".
- GPU skinning is cheap, glTF supports it natively, and picking still works (see section 5).

### Option 2: segment-based FK with joint pivots

Each bone mesh is a node in a hierarchy, pivoting at the joint centre. Bones look perfect. **Muscles that cross a joint break**: a biceps parented to the humerus stays put while the forearm flexes, and the quads separate from the tibia. The only fixes are to cut muscles at joints (visible seams) or to blend each vertex between the two segments' matrices in a shader, which is skinning reinvented. Fine for bones with floating colour patches, not for a premium look.

### Motions as data

Animations are **not** baked glTF clips. A motion is a short list of keyframes of joint angles in anatomical terms (hip flexion 95°, knee flexion 120°…) over normalised time, plus **phase markers** (eccentric 0–0.45, isometric 0.45–0.55, concentric 0.55–1). Planted contacts (feet on the floor, hands on a bar) use two-bone IK.

About 40 parameterised base motions (squat, hinge, lunge, horizontal and vertical press, row, pulldown, curl, extension, raise, fly, crunch, rotation, carry, jump, the Olympic pulls…) cover 150–300 exercises through parameters such as depth, stance, grip and torso angle. The phase markers drive the highlighting:

| Role (fixed per exercise) | Colour | Pattern (colour-blind safe) | Phase behaviour |
|---|---|---|---|
| Prime mover | strong red | solid | pulses and glows while shortening; steady glow when isometric |
| Synergist | orange | diagonal stripes | same, weaker |
| Stabilizer | amber | dots | steady, no pulse |
| Lengthening under load | cool blue | bands that flow along the fibres | flow speed follows the lengthening speed |
| Uninvolved | translucent grey | none | the skeleton shows through |

Tier (high, moderate, low) sets saturation and glow strength. Patterns live in object space, so they don't swim as you orbit. The legend is always on screen and uses the same patterns as CSS.

---

## 5. Architecture

**Stack:** Vite, React, TypeScript (strict), three.js through React Three Fiber and drei, @react-three/postprocessing, Zustand, Tailwind, Framer Motion, React Router, Fuse.js, Zod (data validation in tests) and Vitest. Exact versions get pinned at scaffold.

### Asset pipeline (offline, `pipeline/`, Node scripts)

```
source OBJs ─► select muscles+bones via mesh-map.csv ─► units mm→m, Z-up→Y-up
  ─► Taubin smooth ─► decimate (meshoptimizer) to 2 LODs ─► add generated muscles
  ─► per-vertex attributes: muscleIndex, fibreDir, layer
  ─► build armature (joint centres fitted from bone geometry) ─► compute skin weights
  ─► glTF ─► gltf-transform: meshopt + quantise ─► public/models/body-{high,low}.glb
```

Budgets: high ≤ 400k tris / ≤ 4 MB, low ≤ 120k tris / ≤ 1.5 MB, fewer than 20 draw calls.

### Rendering

- **Muscles are merged into a few skinned meshes**, not ~170 separate materials. A custom `MeshPhysicalMaterial` (sheen and clearcoat for a wet-tissue look) reads each muscle's state (role, tier, mode, pulse, visible, hovered) from a small **DataTexture** indexed by the `muscleIndex` vertex attribute. Changing the exercise just rewrites that texture and tweens it on the GPU.
- **X-ray / translucency:** two passes. Active muscles draw opaque; neutral ones draw translucent with depth-write off, so the skeleton shows through cleanly.
- **Layer toggles** (skeleton only, muscles only, x-ray, superficial or deep) are visibility flags in the same texture.
- **Picking:** GPU id picking. The muscle index is rendered into a 1×1 target under the cursor, which is exact on a skinned mesh and costs nothing extra on mobile. It handles hover tooltips and click-to-select.
- **Look:** a studio HDRI (CC0, Poly Haven) plus soft key lights, N8AO (subtle SSAO), Bloom with a luminance threshold so **only emissive, active muscles bloom**, ACES Filmic tone mapping and SMAA.
- **Low-quality toggle:** low LOD, DPR 1, no AO or bloom. It switches on automatically when frame time stays above budget.
- **Camera:** drei `CameraControls` for orbit, zoom, pan and the front, back and side presets. On exercise select, it fits a sphere around the active muscles in the current pose, using the exercise's preferred side or the muscles' `view`.
- **Props:** simple procedural barbell, dumbbell, bench, cable, bar, kettlebell, band and box, attached to the hand bones or the world.

### App structure

- **State (Zustand):** `viewer` (layers, quality, hover and selection, camera), `playback` (exercise, time, speed, playing, phase), `compare`, `workout` (persisted to localStorage; encoded in the URL as `?w=` base64url of compact ids, sets and frequency).
- **Routes:** `/`, `/exercise/:id`, `/muscle/:id`, `/compare/:a/:b`, `/workout?w=…`.
- **Data:** `src/data/muscles.ts` (registry: function, origin, insertion, layer, view), `src/data/exercises/<category>.ts`, `src/data/motions/*.ts`, `src/data/sources.ts`. A small search index (id, name, aliases, category, equipment, prime movers) ships first, and full entries load as one lazy chunk.
- **Search:** Fuse.js over names, aliases and muscle names. Queries like "X vs Y" offer compare mode.
- **Reverse lookup:** for a muscle, rank exercises by role weight × tier weight.
- **Workout heatmap:** weekly load per muscle = Σ sets × perWeek × role and tier weight. Muscles under a threshold get flagged as neglected.
- **UI:** full-screen canvas. A glass library rail on the left and a glass detail panel on the right, both collapsible and never covering the model's centre. A transport bar at the bottom (play, speed, a scrubber split into colour-coded phases) and a legend chip. **Below 768 px:** one bottom sheet with peek, half and full snaps, and the canvas stays full-screen.
- **Accessibility:** `/` focuses search, arrow keys move through lists, Space plays or pauses, 1–3 pick camera presets, `[` `]` scrub. The muscle list in the panel is the keyboard and screen-reader equivalent of clicking the model. `prefers-reduced-motion` turns off pulsing and slows the camera. The footer reads "Educational only, not medical advice."

### Folder layout

```
pipeline/            asset build scripts + mesh-map.csv (source assets git-ignored)
public/models/       built GLBs
src/
  data/              schema.ts, muscles.ts, exercises/, motions/, sources.ts
  three/             scene, rig, materials (muscle shader), picking, props, camera
  features/          library, exercise-panel, compare, workout, muscle-lookup
  state/             zustand stores
  ui/                shared components (glass panel, bottom sheet, legend)
  lib/               search, url codec, load calc
tests/               data integrity + logic tests (Vitest)
docs/                this plan, credits
```

---

## 6. Data schema

The schema is in [`src/data/schema.ts`](../src/data/schema.ts). It type-checks with `tsc --strict` against a sample entry. Key points:

- **Muscle ids are side-less** (86 ids, about 170 meshes once both sides are counted). Heads and parts get their own id, so the three deltoid heads and the three pec major parts can each be coloured.
- **Each exercise lists `muscles: { id, role, tier, note, side?, phases?, notes?, sourceIds? }`.** Per-phase contraction modes are **derived by default** from the role and the phase kind, with overrides only where needed. That keeps 300 entries manageable.
- **`side` is relative to the working limb** (`working` / `non-working`), so unilateral lifts such as suitcase carries and split squats work.
- **`variations[].muscleDeltas`** feeds the compare difference overlay. **`status: 'draft' | 'reviewed'`** hides unreviewed entries in production.
- **Tiers only, never percentages.** Where studies disagree, `notes` records the consensus used and the minority finding.

Sample (illustrative; real entries get researched and cited in step 3):

```ts
{
  id: 'barbell-back-squat',
  name: 'Barbell back squat',
  aliases: ['back squat', 'squat', 'high-bar squat', 'BB squat'],
  category: 'legs', alsoIn: ['glutes', 'powerlifting'],
  equipment: ['barbell'], difficulty: 'intermediate',
  movementPattern: 'squat', laterality: 'bilateral',
  phases: [
    { kind: 'eccentric', label: 'Descent', jointActions: [
      { joint: 'hip', motion: 'flexion' }, { joint: 'knee', motion: 'flexion' },
      { joint: 'ankle', motion: 'dorsiflexion' }, { joint: 'lumbar-spine', motion: 'isometric-hold' } ] },
    { kind: 'concentric', label: 'Drive up', jointActions: [ /* hip + knee extension, plantarflexion */ ] },
  ],
  muscles: [
    { id: 'vastus-lateralis', role: 'prime', tier: 'high', note: 'Extends the knee out of the bottom.' },
    { id: 'gluteus-maximus', role: 'prime', tier: 'high', note: 'Extends the hip; demand rises with depth.' },
    { id: 'rectus-femoris', role: 'synergist', tier: 'moderate',
      note: 'Also a hip flexor, so it stays near one length and works less than the vasti.' },
    { id: 'adductor-magnus', role: 'synergist', tier: 'high', note: 'Strong hip extensor at depth.' },
    { id: 'longissimus', role: 'stabilizer', tier: 'high', note: 'Resists spinal flexion under the bar.' },
    // …
  ],
  cues: ['Brace before every rep.', 'Knees track over the toes.'],
  mistakes: [{ mistake: 'Knees cave in on the way up', fix: 'Cue knees out; lighten the load.' }],
  variations: [{ exerciseId: 'barbell-front-squat', name: 'Front squat',
    emphasisShift: 'More upright torso: more quad, less hip and lower-back demand.',
    muscleDeltas: [{ id: 'vastus-lateralis', change: 'more' }, { id: 'longissimus', change: 'less' }] }],
  animation: { motionId: 'squat', params: { depth: 0.95, bar: 'high' }, props: ['barbell'] },
  camera: { preset: 'side' },
  sourceIds: ['escamilla-2001-squat'],
  status: 'draft',
}
```

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| The six generated muscles (A) look procedural next to the scanned ones | Judge them in step 2; commission an artist for those six if needed |
| BodyParts3D meshes look lumpy up close | Smoothing, fibre shader, clearcoat; Zygote as the paid fallback |
| Shoulder deformation in overhead moves | Scapula bones + helper bones + shader volume preservation; tune in step 4 |
| Accuracy of 150+ activation entries | Tiers only, cited sources, `draft` / `reviewed` status, integrity tests |
| 60 fps on phones | Low LOD, merged meshes, GPU picking, auto low-quality |

---

## Sources

- BodyParts3D licence (CC BY 4.0, updated 2025-02-27): https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- BodyParts3D README and downloads: https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/README_e.html, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- BodyParts3D parts lists (muscle coverage checked here): https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_parts_list_e.txt, https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_parts_list_e.txt
- Mesh count and processing notes from a BodyParts3D web atlas: https://raw.githubusercontent.com/ashemag/human-atlas/master/public/ATTRIBUTION.md
- Z-Anatomy (licence, attribution, files): https://github.com/Z-Anatomy/Models-of-human-anatomy
- Ecorché rigged set: https://superhivemarket.com/products/muscle-anatomy---ecorche-rigged
- Ecorché static set: https://superhivemarket.com/products/muscle-anatomy-visualized--ecorche
- TurboSquid Royalty Free License: https://blog.turbosquid.com/royalty-free-license/
- TurboSquid rigged anatomy listings: https://www.turbosquid.com/3d-models/complete-human-anatomy-male-1930116, https://www.turbosquid.com/3d-models/male-full-anatomy-rigged-blender-3d-model-2134382
- CGTrader terms (royalty-free licence §21A): https://www.cgtrader.com/pages/terms-and-conditions
- Sketchfab Store closure and the move to Fab: https://sketchfab.com/blogs/community/sketchfab-update-what-you-need-to-know-now-that-fabs-live/
- Fab licence summary and tiers: https://www.fab.com/eula, https://dev.epicgames.com/documentation/fab/licenses-and-pricing-in-fab
- Fab web-app licensing question (unanswered): https://forums.unrealengine.com/t/can-i-use-3d-assets-from-fab-s-standard-license-in-a-revenue-generating-web-app/2453541
