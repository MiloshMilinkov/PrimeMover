import { Link } from 'react-router';
import { EXERCISE_BY_ID } from '../data/exercises';
import { CATEGORY_LABEL } from '../data/labels';
import { patternCss, ROLES } from '../data/roles';
import type { Category } from '../data/schema';
import { useLibrary } from '../state/library';
import { Section, TierMeter } from './ExercisePanel';
import { RoleSwatch } from './Legend';

/** Lifts most people ask about first. */
const POPULAR = [
  'barbell-back-squat',
  'barbell-bench-press',
  'conventional-deadlift',
  'pull-up',
  'barbell-hip-thrust',
  'push-up',
  'dumbbell-lateral-raise',
  'plank',
].filter((id) => id in EXERCISE_BY_ID);

const BROWSE_CATEGORIES: Category[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'mobility'];

/** Quick ways in: popular exercises and body areas. `onBrowse` opens the list when it is hidden. */
function QuickPicks({ onBrowse }: { onBrowse?: () => void }) {
  const browseCategory = useLibrary((s) => s.browseCategory);
  return (
    <>
      <Section title="Popular exercises" divided={false}>
        <ul className="flex flex-wrap gap-1.5">
          {POPULAR.map((id) => (
            <li key={id}>
              <Link to={`/exercise/${id}`} className="chip">
                {EXERCISE_BY_ID[id].name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Browse by body area" divided={false}>
        <ul className="flex flex-wrap gap-1.5">
          {BROWSE_CATEGORIES.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => {
                  browseCategory(c);
                  onBrowse?.();
                }}
                className="chip"
              >
                {CATEGORY_LABEL[c]}
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/**
 * First screen: what the app does, quick ways in, and how to read the colours.
 * `compact` (the mobile sheet) keeps only the quick ways in, above the library.
 */
export function Welcome({ compact = false, onBrowse }: { compact?: boolean; onBrowse?: () => void }) {
  if (compact)
    return (
      <div className="flex flex-col gap-5">
        <QuickPicks />
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.01em]">See which muscles do the work</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ivory/85">
          Pick an exercise and the body lights up the muscles it uses, how hard each one works, and the research behind it. Click any
          muscle on the body to learn about it.
        </p>
      </header>

      <QuickPicks onBrowse={onBrowse} />

      <Section title="Reading the body">
        <ul className="flex flex-col gap-2.5 text-[14px] leading-snug">
          {ROLES.map((r) => (
            <li key={r.role} className="flex gap-2.5">
              <RoleSwatch background={patternCss(r)} className="mt-1" />
              <span>
                <span className="font-medium">{r.label}.</span> <span className="text-ivory/80">{r.description}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ivory/80">
          <TierMeter tier="high" />
          <span>Bars show how hard a muscle works: high, moderate or low.</span>
        </p>
      </Section>

      <p className="text-[12px] leading-relaxed text-fog">
        Shortcuts: <kbd className="kbd">/</kbd> search, <kbd className="kbd">1</kbd> <kbd className="kbd">2</kbd> <kbd className="kbd">3</kbd>{' '}
        front, back and side views, <kbd className="kbd">Esc</kbd> back to start.
      </p>
    </div>
  );
}
