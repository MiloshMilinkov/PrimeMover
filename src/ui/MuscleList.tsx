import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MUSCLE_GROUP_LABEL, MUSCLE_GROUP_ORDER } from '../data/labels';
import { MUSCLES } from '../data/muscles';
import { useViewer } from '../state/viewer';
import { usePreviewProps } from './preview';

/**
 * Every muscle, grouped by region. This is also the keyboard and screen-reader
 * route to everything clicking the model does.
 */
export function MuscleList({ onPick }: { onPick?: () => void }) {
  const [query, setQuery] = useState('');
  const selected = useViewer((s) => s.selected);
  const preview = usePreviewProps();

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (m: (typeof MUSCLES)[number]) =>
      !q || [m.name, m.latinName, m.parent ?? ''].some((t) => t.toLowerCase().includes(q));
    return MUSCLE_GROUP_ORDER.map((g) => ({ group: g, muscles: MUSCLES.filter((m) => m.group === g && match(m)) })).filter(
      (g) => g.muscles.length,
    );
  }, [query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <label className="mx-4 mb-2 block">
        <span className="sr-only">Find a muscle</span>
        <input
          id="muscle-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a muscle"
          autoComplete="off"
          className="field"
        />
      </label>
      <nav aria-label="Muscles" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
        {groups.length === 0 && <p className="px-2 py-3 text-[14px] text-fog">No muscle matches “{query}”. Try a Latin or English name.</p>}
        {groups.map(({ group, muscles }) => (
          <section key={group} className="mb-2">
            <h3 className="px-2 pb-1 pt-2 text-[12px] font-medium text-fog">{MUSCLE_GROUP_LABEL[group]}</h3>
            <ul>
              {muscles.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/muscle/${m.id}`}
                    onClick={onPick}
                    {...preview(m.id)}
                    aria-current={m.id === selected ? 'page' : undefined}
                    className="list-item text-[14px] leading-snug"
                  >
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  );
}
