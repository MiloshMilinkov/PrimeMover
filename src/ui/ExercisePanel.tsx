import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { exercisePath } from '../data/exercises';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, EQUIPMENT_LABEL, jointActionText, PHASE_KIND_LABEL, SIDE_LABEL } from '../data/labels';
import { MUSCLE_BY_ID } from '../data/muscles';
import { patternCss, ROLE_BY_NAME, TIER_LABEL } from '../data/roles';
import type { Exercise, MuscleId, MuscleInvolvement, MuscleRole, Tier } from '../data/schema';
import { SOURCE_BY_ID } from '../data/sources';
import { capitalise, joinList } from '../lib/text';
import { useViewer } from '../state/viewer';
import { RoleSwatch } from './Legend';
import { usePreviewProps } from './preview';

/** Order of role groups in the panel: what drives the lift first. */
const ROLE_ORDER: MuscleRole[] = ['prime', 'lengthening', 'synergist', 'stabilizer'];
const TIER_BARS: Record<Tier, number> = { high: 3, moderate: 2, low: 1 };

function TierMeter({ tier }: { tier: Tier }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-fog">
      <span aria-hidden className="flex items-end gap-[2px]">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`w-[3px] rounded-[1px] ${n <= TIER_BARS[tier] ? 'bg-ivory' : 'bg-hairline-strong'}`} style={{ height: 4 + n * 3 }} />
        ))}
      </span>
      {TIER_LABEL[tier]}
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-hairline pt-4">
      <h3 className="mb-2 text-[13px] font-semibold text-ivory">{title}</h3>
      {children}
    </section>
  );
}

function MuscleRow({ exerciseId, m, focused }: { exerciseId: string; m: MuscleInvolvement; focused: boolean }) {
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
          {MUSCLE_BY_ID[m.id].name}
          {side && <span className="font-normal text-fog">, {side}</span>}
        </Link>
        <TierMeter tier={m.tier} />
      </div>
      <p className="mt-0.5 text-[13px] leading-snug text-ivory/80">{m.note}</p>
      {m.notes && (
        <details className="mt-1 text-[12px] text-fog">
          <summary className="cursor-pointer hover:text-ivory">Research note</summary>
          <p className="mt-1 leading-snug">{m.notes}</p>
        </details>
      )}
    </li>
  );
}

/** Everything about one exercise: how it moves, which muscles work and how hard, and how to do it well. */
export function ExercisePanel({ exercise: e, focus, titleHidden = false }: { exercise: Exercise; focus: MuscleId | null; titleHidden?: boolean }) {
  const frameExercise = useViewer((s) => s.frameExercise);
  const focusInExercise = focus && e.muscles.some((m) => m.id === focus);

  return (
    <article aria-labelledby="exercise-title" className="flex flex-col gap-4">
      <header>
        <ul className="mb-2 flex flex-wrap gap-1.5 text-[12px] text-fog">
          {[CATEGORY_LABEL[e.category], DIFFICULTY_LABEL[e.difficulty], ...e.equipment.map((q) => EQUIPMENT_LABEL[q])].map((t) => (
            <li key={t} className="rounded-full border border-hairline px-2 py-0.5">
              {t}
            </li>
          ))}
        </ul>
        <h2 id="exercise-title" className={titleHidden ? 'sr-only' : 'text-[22px] font-semibold leading-tight tracking-[-0.01em]'}>
          {e.name}
        </h2>
        {e.aliases.length > 0 && <p className="mt-1 text-[13px] text-fog">Also called {joinList(e.aliases)}.</p>}
        <button type="button" onClick={() => frameExercise(e)} className="btn-secondary mt-3">
          Frame working muscles
        </button>
      </header>

      {focus && !focusInExercise && (
        <p className="rounded-control bg-hairline px-3 py-2 text-[13px]">
          {MUSCLE_BY_ID[focus].name} isn’t used much in this exercise.{' '}
          <Link to={`/muscle/${focus}`} className="link">
            Open the muscle page
          </Link>
        </p>
      )}

      <Section title="How it moves">
        <ol className="flex flex-col gap-2">
          {e.phases.map((p) => (
            <li key={p.label} className="text-[14px] leading-snug">
              <span className="font-medium">{p.label}</span> <span className="text-[12px] text-fog">{PHASE_KIND_LABEL[p.kind]}</span>
              <span className="block text-ivory/80">{capitalise(joinList(p.jointActions.map(jointActionText)))}.</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Muscles">
        <div className="flex flex-col gap-3">
          {ROLE_ORDER.map((role) => {
            const list = e.muscles.filter((m) => m.role === role);
            if (list.length === 0) return null;
            const style = ROLE_BY_NAME[role];
            return (
              <div key={role}>
                <h4 className="mb-1 flex items-center gap-2 text-[13px] text-fog">
                  <RoleSwatch background={patternCss(style)} />
                  {style.label}
                </h4>
                <ul className="-mx-2">
                  {list.map((m) => (
                    <MuscleRow key={`${m.id}/${m.side ?? 'both'}`} exerciseId={e.id} m={m} focused={focus === m.id} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Cues">
        <ul className="list-disc space-y-1 pl-5 text-[14px] leading-snug text-ivory/90">
          {e.cues.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Section>

      <Section title="Common mistakes">
        <dl className="space-y-2 text-[14px] leading-snug">
          {e.mistakes.map((x) => (
            <div key={x.mistake}>
              <dt className="font-medium">{x.mistake}</dt>
              <dd className="text-ivory/80">{x.fix}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Variations">
        <ul className="space-y-2 text-[14px] leading-snug">
          {e.variations.map((v) => (
            <li key={v.name}>
              {v.exerciseId ? (
                <Link to={exercisePath(v.exerciseId)} className="link font-medium">
                  {v.name}
                </Link>
              ) : (
                <span className="font-medium">{v.name}</span>
              )}
              <span className="block text-ivory/80">{v.emphasisShift}</span>
            </li>
          ))}
        </ul>
      </Section>

      {e.notes && (
        <Section title="Notes">
          <p className="text-[14px] leading-snug text-ivory/80">{e.notes}</p>
        </Section>
      )}

      <Section title="Sources">
        <ol className="list-decimal space-y-1.5 pl-5 text-[12px] leading-snug text-fog">
          {e.sourceIds.map((sid) => {
            const s = SOURCE_BY_ID[sid];
            return (
              <li key={sid}>
                {s.citation}{' '}
                {s.doi && (
                  <a href={`https://doi.org/${s.doi}`} target="_blank" rel="noreferrer" className="link">
                    doi:{s.doi}
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
