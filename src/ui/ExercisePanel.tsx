import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { exercisePath } from '../data/exercises';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, EQUIPMENT_LABEL, EVIDENCE_LABEL, jointActionText, PHASE_KIND_LABEL, SIDE_LABEL } from '../data/labels';
import { MUSCLE_BY_ID } from '../data/muscles';
import { patternCss, ROLE_BY_NAME, TIER_LABEL } from '../data/roles';
import type { Exercise, MuscleId, MuscleInvolvement, MuscleRole, Tier } from '../data/schema';
import { SOURCE_BY_ID } from '../data/sources';
import { areasFor } from '../lib/areas';
import { useT, type Translator } from '../i18n';
import { capitalise } from '../lib/text';
import { useViewer } from '../state/viewer';
import { RoleSwatch } from './Legend';
import { usePreviewProps } from './preview';

/** Order of role groups in the panel: what drives the lift first. */
const ROLE_ORDER: MuscleRole[] = ['prime', 'lengthening', 'synergist', 'stabilizer'];
const TIER_BARS: Record<Tier, number> = { high: 3, moderate: 2, low: 1 };

export function TierMeter({ tier }: { tier: Tier }) {
  const { t } = useT();
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-fog">
      <span aria-hidden className="flex items-end gap-[2px]">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`w-[3px] rounded-[1px] ${n <= TIER_BARS[tier] ? 'bg-ivory' : 'bg-hairline-strong'}`} style={{ height: 4 + n * 3 }} />
        ))}
      </span>
      {t(TIER_LABEL[tier])}
    </span>
  );
}

/** A titled panel section; `divided` draws the hairline above it. */
export function Section({ title, id, divided = true, children }: { title: string; id?: string; divided?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-4 ${divided ? 'border-t border-hairline pt-4' : ''}`}>
      <h3 className="mb-2 text-[13px] font-semibold text-ivory">{title}</h3>
      {children}
    </section>
  );
}

function MuscleRow({ exerciseId, m, focused }: { exerciseId: string; m: MuscleInvolvement; focused: boolean }) {
  const { t } = useT();
  const preview = usePreviewProps();
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focused]);
  const side = SIDE_LABEL[m.side ?? 'both'];
  return (
    <li ref={ref} className={`rounded-control px-2 py-2 ${focused ? 'bg-hairline ring-1 ring-hairline-strong' : ''}`}>
      <div className="flex items-baseline justify-between gap-3">
        <Link
          to={exercisePath(exerciseId, m.id)}
          aria-current={focused ? 'true' : undefined}
          {...preview(m.id)}
          className="text-[14px] font-medium leading-snug underline-offset-2 hover:underline"
        >
          {t(MUSCLE_BY_ID[m.id].name)}
          {side && <span className="font-normal text-fog">, {t(side)}</span>}
        </Link>
        <TierMeter tier={m.tier} />
      </div>
      <p className="mt-0.5 text-[13px] leading-snug text-ivory/80">{t(m.note)}</p>
      {m.notes && (
        <details className="mt-1 text-[12px] text-fog">
          <summary className="cursor-pointer hover:text-ivory">{t('Research note')}</summary>
          <p className="mt-1 leading-snug">{t(m.notes)}</p>
        </details>
      )}
    </li>
  );
}

/** "Mainly works the quads and glutes, with help from the hamstrings. Stretches the hip flexors." */
function summary(e: Exercise, { t, list }: Translator) {
  const areas = (role: MuscleRole) => areasFor(e, role).map((a) => t(a));
  const prime = areas('prime');
  const helpers = areas('synergist').filter((a) => !prime.includes(a));
  const stretched = areas('lengthening').filter((a) => !prime.includes(a));
  const works = !prime.length
    ? ''
    : helpers.length
      ? t('Mainly works the {prime}, with help from the {helpers}.', { prime: list(prime), helpers: list(helpers) })
      : t('Mainly works the {prime}.', { prime: list(prime) });
  const loaded = prime.length > 0 && e.movementPattern !== 'stretch';
  const stretches = !stretched.length
    ? ''
    : loaded
      ? t('Stretches the {areas} under load.', { areas: list(stretched) })
      : t('Stretches the {areas}.', { areas: list(stretched) });
  return [works, stretches].filter(Boolean).join(' ');
}

/** Everything about one exercise: how it moves, which muscles work and how hard, and how to do it well. */
export function ExercisePanel({ exercise: e, focus, titleHidden = false }: { exercise: Exercise; focus: MuscleId | null; titleHidden?: boolean }) {
  const tr = useT();
  const { t, lang, list } = tr;
  const frameExercise = useViewer((s) => s.frameExercise);
  const focusInExercise = focus && e.muscles.some((m) => m.id === focus);

  return (
    <article aria-labelledby="exercise-title" className="flex flex-col gap-4">
      <header>
        <ul className="mb-2 flex flex-wrap gap-1.5 text-[12px] text-fog">
          {[...new Set([CATEGORY_LABEL[e.category], DIFFICULTY_LABEL[e.difficulty], ...e.equipment.map((q) => EQUIPMENT_LABEL[q])])].map((tag) => (
            <li key={tag} className="rounded-full border border-hairline px-2 py-0.5">
              {t(tag)}
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => document.getElementById('evidence')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              aria-label={t('Evidence: {level}. Jump to sources', { level: t(EVIDENCE_LABEL[e.evidence].title) })}
              className="block rounded-full bg-hairline px-2 py-0.5 text-ivory/85 hover:text-ivory"
            >
              {t(EVIDENCE_LABEL[e.evidence].badge)}
            </button>
          </li>
        </ul>
        <h2 id="exercise-title" className={titleHidden ? 'sr-only' : 'text-[22px] font-semibold leading-tight tracking-[-0.01em]'}>
          {t(e.name)}
        </h2>
        {/* In another language the English name comes first: many gyms use it. Aliases are English gym terms. */}
        {lang !== 'en' && <p className="mt-1 text-[13px] text-fog">{t('In English: {name}.', { name: e.name })}</p>}
        {e.aliases.length > 0 && <p className="mt-1 text-[13px] text-fog">{t('Also called {names}.', { names: list(e.aliases) })}</p>}
        <p className="mt-3 text-[15px] leading-snug text-ivory/90">{summary(e, tr)}</p>
        <button type="button" onClick={() => frameExercise(e)} className="btn-secondary mt-3">
          {t('Frame working muscles')}
        </button>
      </header>

      {focus && !focusInExercise && (
        <p className="rounded-control bg-hairline px-3 py-2 text-[13px]">
          {t('{muscle} isn’t used much in this exercise.', { muscle: t(MUSCLE_BY_ID[focus].name) })}{' '}
          <Link to={`/muscle/${focus}`} className="link">
            {t('Open the muscle page')}
          </Link>
        </p>
      )}

      <Section title={t('How it moves')}>
        <ol className="flex flex-col gap-2">
          {e.phases.map((p) => (
            <li key={p.label} className="text-[14px] leading-snug">
              <span className="font-medium">{t(p.label)}</span> <span className="text-[12px] text-fog">{t(PHASE_KIND_LABEL[p.kind])}</span>
              <span className="block text-ivory/80">{capitalise(list(p.jointActions.map((a) => jointActionText(a, lang))))}.</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={t('Muscles')}>
        <div className="flex flex-col gap-3">
          {ROLE_ORDER.map((role) => {
            const ofRole = e.muscles.filter((m) => m.role === role);
            if (ofRole.length === 0) return null;
            const style = ROLE_BY_NAME[role];
            return (
              <div key={role}>
                <h4 className="mb-1 flex items-center gap-2 text-[13px] text-fog">
                  <RoleSwatch background={patternCss(style)} />
                  {t(style.label)}
                </h4>
                <ul className="-mx-2">
                  {ofRole.map((m) => (
                    <MuscleRow key={`${m.id}/${m.side ?? 'both'}`} exerciseId={e.id} m={m} focused={focus === m.id} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={t('Cues')}>
        <ul className="list-disc space-y-1 pl-5 text-[14px] leading-snug text-ivory/90">
          {e.cues.map((c) => (
            <li key={c}>{t(c)}</li>
          ))}
        </ul>
      </Section>

      <Section title={t('Common mistakes')}>
        <dl className="space-y-2 text-[14px] leading-snug">
          {e.mistakes.map((x) => (
            <div key={x.mistake}>
              <dt className="font-medium">{t(x.mistake)}</dt>
              <dd className="text-ivory/80">{t(x.fix)}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={t('Variations')}>
        <ul className="space-y-2 text-[14px] leading-snug">
          {e.variations.map((v) => (
            <li key={v.name}>
              {v.exerciseId ? (
                <Link to={exercisePath(v.exerciseId)} className="link font-medium">
                  {t(v.name)}
                </Link>
              ) : (
                <span className="font-medium">{t(v.name)}</span>
              )}
              <span className="block text-ivory/80">{t(v.emphasisShift)}</span>
            </li>
          ))}
        </ul>
      </Section>

      {e.notes && (
        <Section title={t('Notes')}>
          <p className="text-[14px] leading-snug text-ivory/80">{t(e.notes)}</p>
        </Section>
      )}

      <Section title={t('Evidence and sources')} id="evidence">
        <p className="mb-2 text-[13px] leading-snug text-ivory/80">
          <span className="font-semibold text-ivory">{t(EVIDENCE_LABEL[e.evidence].title)}.</span> {t(EVIDENCE_LABEL[e.evidence].detail)}
        </p>
        <ol className="list-decimal space-y-1.5 pl-5 text-[12px] leading-snug text-fog">
          {e.sourceIds.map((sid) => {
            const s = SOURCE_BY_ID[sid];
            const href = s.doi ? `https://doi.org/${s.doi}` : s.url;
            return (
              <li key={sid}>
                {s.citation}{' '}
                {href && (
                  <a href={href} target="_blank" rel="noreferrer" className="link">
                    {s.doi ? `doi:${s.doi}` : t('link')}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </Section>
    </article>
  );
}
