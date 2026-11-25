# Muscle activation evidence

How the library decides which muscles an exercise works, how hard, and how sure we are. Written 2026-11-25, when the library grew from 30 to 128 exercises.

## What public data exists

- **No single open dataset of whole-body EMG by exercise exists.** The evidence is spread over hundreds of individual EMG studies, each covering a few exercises and a few muscles, and a handful of systematic reviews.
- **Systematic reviews** give the most reliable rankings where they exist: gluteus maximus (Neto 2020; Krause Neto 2025 for hypertrophy), the deadlift and its variants (Martín-Fuentes 2020), the pectoralis major across presses and flys (López-Vivancos 2023), core stability (Hibbs 2008), plyometrics (Markovic 2010), weightlifting (Storey 2012) and stretching (Behm 2016).
- **Single EMG studies** cover most popular lifts: squat depth and stance, hip thrust, hamstring exercises, rows and pulldowns, push-up variants, shoulder and rotator-cuff exercises, trapezius and serratus, elbow flexors and triceps, abdominal exercises, kettlebell swing and snatch, and strongman carries. All 71 sources are in `src/data/sources.ts`; each DOI or PubMed link was checked against Crossref or PubMed when it was added.
- **Open exercise datasets** are editorial, not measured:
  - [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense; about 870 exercises; 17 coarse muscle groups as primary and secondary). Its origin is unclear, so we use it only as an internal cross-check and never ship it.
  - [wger](https://wger.de) exercise data is CC BY-SA. Share-alike conflicts with this project's licence, so we do not use it.
  - ExRx and similar reference sites are copyrighted; we do not copy from them.

## How each exercise is built

1. Joint actions per phase, from the movement (Neumann 2017, *Kinesiology of the Musculoskeletal System*).
2. Muscles and roles from those joint actions:
   - **prime**: the main movers;
   - **synergist**: muscles that help;
   - **stabilizer**: muscles that hold a joint still against the load;
   - **lengthening**: muscles stretched under load, or the target of a stretch.
3. Tiers (high, moderate, low) set from EMG where a study measured that muscle, and otherwise from the joint actions. We never use percentages. A study that supports a specific muscle is cited on that muscle; disagreements go in `notes`.
4. An **evidence level** for the whole exercise, shown in the panel under "Evidence and sources":

| Level | Meaning | Exercises |
|---|---|---|
| `emg` | EMG studies recorded these muscles during this exercise | 62 |
| `related` | EMG on close variations or the same movement, plus anatomy | 34 |
| `anatomy` | No direct EMG found; roles follow from joint actions and anatomy | 32 |

Stretches are all `anatomy`: stretching research measures range of motion, not which muscle lengthens. The muscle-tendon paths settle that (for example, a straight knee stretches the gastrocnemius and a bent knee the soleus).

## Cross-check against free-exercise-db

`tests/crosscheck.test.ts` compares our roles with free-exercise-db. It is skipped unless you pass the dataset path:

```
FREE_EXERCISE_DB=path/to/exercises.json npx vitest run tests/crosscheck.test.ts
```

Add `CROSSCHECK_REPORT=1` to print every flag. Each of their 17 groups maps to a set of our 86 muscle ids, and the test flags two things:

- one of their **primary** groups has none of our moving or stretched muscles;
- one of our **high-tier prime** (or most-stretched) muscles is in a group they don't list at all.

Results: 117 of our 128 exercises were matched (11 have no counterpart there). There were 9 flags. We reviewed each one, and none was an error in our data. Each is kept in `ACCEPTED` with its reason, so any new flag fails the test.

- Deadlift: they call the lower back primary. We show the erectors as high-tier stabilizers, because they hold the spine still rather than move it.
- Side-lying hip abduction: their entry labels lifting the leg sideways as "adductors", which looks like a labelling slip.
- Lying leg raise: they call it an ab exercise. The hip flexors lift the legs; the abdominals hold the pelvis (a high-tier stabilizer, explained in the notes).
- Hammer curl (brachioradialis), side plank (quadratus lumborum), mountain climber (abdominals), thruster (glutes) and child's pose (lats): we list a muscle that their coarse groups leave out or don't consider.

## Limits

- EMG amplitude shows activation, not growth or strength gain, and normalisation differs between studies. Tiers are rankings, not measurements.
- Most studies test young, trained adults with a few muscles each. Muscles nobody measured, such as the deep rotators and the brachialis in most lifts, rest on anatomy.
- Activation changes with technique, load and range. The notes and variations say where that changes the picture.
