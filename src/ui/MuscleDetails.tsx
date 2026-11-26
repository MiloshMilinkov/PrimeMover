import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { exercisePath } from '../data/exercises';
import { JOINT_LABEL } from '../data/labels';
import { MUSCLE_BY_ID } from '../data/muscles';
import type { JointId, MuscleId, MuscleLayer, MuscleRole, Tier } from '../data/schema';
import { msg, useT, type Translator } from '../i18n';
import { NO_FILTERS, searchExercises } from '../lib/search';
import { capitalise } from '../lib/text';
import { useViewer } from '../state/viewer';
import { bodyHalfWidthPx } from '../three/camera';
import { Section, TierMeter } from './ExercisePanel';
import { useWindowSize } from './layout';

const LAYER_LABEL: Record<MuscleLayer, string> = {
  superficial: msg('Outer layer'),
  intermediate: msg('Middle layer'),
  deep: msg('Deep layer'),
};

const listJoints = (joints: JointId[], { t, list }: Translator) =>
  joints.length ? capitalise(list(joints.map((j) => t(JOINT_LABEL[j])))) : t('No limb joint (breathing and bracing)');

/** `titleHidden` keeps the name for screen readers when a sheet header already shows it. */
export function MuscleDetails({ id, titleHidden = false }: { id: MuscleId; titleHidden?: boolean }) {
  const tr = useT();
  const { t } = tr;
  const m = MUSCLE_BY_ID[id];
  const frame = useViewer((s) => s.frame);
  const rows: [string, string][] = [
    [t('Origin'), t(m.origin)],
    [t('Insertion'), t(m.insertion)],
    [t('Crosses'), listJoints(m.jointsCrossed, tr)],
    [t('Depth'), t(LAYER_LABEL[m.layer])],
  ];

  return (
    <article aria-labelledby="muscle-title" className="flex flex-col gap-4">
      <header>
        {m.parent && <p className="text-[13px] text-fog">{t(m.parent)}</p>}
        <h2
          id="muscle-title"
          className={titleHidden ? 'sr-only' : 'text-[22px] font-semibold leading-tight tracking-[-0.01em]'}
        >
          {t(m.name)}
        </h2>
        <p className="latin mt-1 text-[18px] leading-snug text-ivory/80">{m.latinName}</p>
      </header>

      <p className="max-w-[60ch] text-[15px] leading-relaxed text-ivory/90">{t(m.function)}</p>

      <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2.5 border-t border-hairline pt-4 text-[14px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-fog">{k}</dt>
            <dd className="leading-snug">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={() => frame([id])} className="btn-primary">
          {t('Zoom to muscle')}
        </button>
        <Link to="/" className="btn-secondary">
          {t('Close')}
        </Link>
      </div>

      <ExercisesFor key={id} id={id} />
    </article>
  );
}

/** Reverse-lookup groups, in the order they are listed. */
const USE_GROUPS: { role: MuscleRole; title: string }[] = [
  { role: 'prime', title: msg('Main mover in') },
  { role: 'synergist', title: msg('Helps in') },
  { role: 'lengthening', title: msg('Stretched in') },
];
const RANK = (role: MuscleRole, tier: Tier) => USE_GROUPS.findIndex((g) => g.role === role) * 3 + ['high', 'moderate', 'low'].indexOf(tier);
const SHOWN = 6;

/** Reverse lookup: the exercises where this muscle drives the lift, then the ones where it helps or is stretched. */
function ExercisesFor({ id }: { id: MuscleId }) {
  const { t, lang } = useT();
  const [all, setAll] = useState(false);
  // The library's muscle filter is the one definition of "works this muscle" (stabilizers excluded).
  const uses = useMemo(
    () =>
      searchExercises('', { ...NO_FILTERS, muscle: id }, lang)
        .map((e) => ({ e, m: e.muscles.find((x) => x.id === id && x.role !== 'stabilizer')! }))
        .sort((a, b) => RANK(a.m.role, a.m.tier) - RANK(b.m.role, b.m.tier)),
    [id, lang],
  );
  if (uses.length === 0) return null;
  const visible = all ? uses : uses.slice(0, SHOWN);

  return (
    <Section title={t('Exercises that work it')}>
      <div className="flex flex-col gap-3">
        {USE_GROUPS.map(({ role, title }) => {
          const list = visible.filter((u) => u.m.role === role);
          if (list.length === 0) return null;
          return (
            <div key={role}>
              <h4 className="mb-1 text-[12px] text-fog">{t(title)}</h4>
              <ul className="-mx-2">
                {list.map(({ e, m }) => (
                  <li key={e.id}>
                    <Link to={exercisePath(e.id, id)} className="list-item text-[14px]">
                      <span className="flex items-center justify-between gap-3">
                        {t(e.name)}
                        <TierMeter tier={m.tier} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {uses.length > SHOWN && (
        <button type="button" onClick={() => setAll((a) => !a)} className="link mt-2 text-[13px] text-fog">
          {all ? t('Show fewer') : t('Show all {n}', { n: uses.length })}
        </button>
      )}
    </Section>
  );
}

/** Large Latin caption beside the model, like the label on an atlas plate. Desktop only. */
export function PlateCaption() {
  const selected = useViewer((s) => s.selected);
  const insets = useViewer((s) => s.insets);
  const { width, height } = useWindowSize();

  if (!selected) return null;
  const left = insets.left + 16;
  const freeCentre = (insets.left + (width - insets.right)) / 2;
  const maxWidth = freeCentre - bodyHalfWidthPx(height) - 24 - left;
  if (maxWidth < 170) return null;
  return (
    <p
      aria-hidden
      className="latin pointer-events-none absolute z-10 text-[clamp(26px,2.6vw,42px)] leading-[1.08] text-ivory/75"
      style={{ left, top: insets.top + 8, maxWidth }}
    >
      {MUSCLE_BY_ID[selected].latinName}
    </p>
  );
}
