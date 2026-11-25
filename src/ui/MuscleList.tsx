import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MUSCLES } from '../data/muscles';
import type { MuscleGroup } from '../data/schema';
import { useViewer } from '../state/viewer';

const GROUP_LABEL: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Upper arms',
  forearms: 'Forearms',
  core: 'Core',
  neck: 'Neck',
  hips: 'Hips and glutes',
  thighs: 'Thighs',
  'lower-legs': 'Lower legs',
};

const GROUP_ORDER: MuscleGroup[] = ['chest', 'shoulders', 'back', 'arms', 'forearms', 'core', 'neck', 'hips', 'thighs', 'lower-legs'];

/**
 * Every muscle, grouped by region. This is also the keyboard and screen-reader
 * route to everything clicking the model does.
 */
export function MuscleList({ onPick }: { onPick?: () => void }) {
  const [query, setQuery] = useState('');
  const selected = useViewer((s) => s.selected);
  const setPreview = useViewer((s) => s.setPreview);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (m: (typeof MUSCLES)[number]) =>
      !q || [m.name, m.latinName, m.parent ?? ''].some((t) => t.toLowerCase().includes(q));
    return GROUP_ORDER.map((g) => ({ group: g, muscles: MUSCLES.filter((m) => m.group === g && match(m)) })).filter(
      (g) => g.muscles.length,
    );
  }, [query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <label className="relative mx-4 mb-2 block">
        <span className="sr-only">Find a muscle</span>
        <input
          id="muscle-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a muscle"
          autoComplete="off"
          className="w-full rounded-control border border-hairline bg-vitrine-deep/60 px-3 py-2 text-[14px] text-ivory placeholder:text-fog focus:border-hairline-strong focus:outline-none"
        />
      </label>
      <nav aria-label="Muscles" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
        {groups.length === 0 && <p className="px-2 py-3 text-[14px] text-fog">No muscle matches “{query}”. Try a Latin or English name.</p>}
        {groups.map(({ group, muscles }) => (
          <section key={group} className="mb-2">
            <h3 className="px-2 pb-1 pt-2 text-[12px] font-medium text-fog">{GROUP_LABEL[group]}</h3>
            <ul>
              {muscles.map((m) => {
                const active = m.id === selected;
                return (
                  <li key={m.id}>
                    <Link
                      to={`/muscle/${m.id}`}
                      onClick={onPick}
                      onMouseEnter={() => setPreview(m.id)}
                      onMouseLeave={() => setPreview(null)}
                      onFocus={() => setPreview(m.id)}
                      onBlur={() => setPreview(null)}
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-[8px] px-2 py-1.5 text-[14px] leading-snug transition-colors ${
                        active ? 'bg-ivory text-vitrine' : 'text-ivory/90 hover:bg-hairline'
                      }`}
                    >
                      {m.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  );
}
