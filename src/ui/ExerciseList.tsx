import { useMemo, useState, type ReactNode } from 'react';
import { Link, useMatch } from 'react-router';
import { categoriesOf, EXERCISES } from '../data/exercises';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, EQUIPMENT_LABEL, MUSCLE_GROUP_LABEL, MUSCLE_GROUP_ORDER } from '../data/labels';
import { MUSCLE_BY_ID, MUSCLES } from '../data/muscles';
import type { Category, Difficulty, Exercise } from '../data/schema';
import { mainAreas } from '../lib/areas';
import { searchExercises, type ExerciseFilters } from '../lib/search';
import { capitalise, joinList, lowerFirst } from '../lib/text';
import { useLibrary } from '../state/library';

const usedEquipment = [...new Set(EXERCISES.flatMap((e) => e.equipment))].sort((a, b) => EQUIPMENT_LABEL[a].localeCompare(EQUIPMENT_LABEL[b]));
const usedCategories = [...new Set(EXERCISES.flatMap(categoriesOf))];

/** Options built once: the muscle filter lists every muscle, grouped by region. */
const MUSCLE_OPTIONS = MUSCLE_GROUP_ORDER.map((g) => (
  <optgroup key={g} label={MUSCLE_GROUP_LABEL[g]}>
    {MUSCLES.filter((m) => m.group === g).map((m) => (
      <option key={m.id} value={m.id}>
        {m.name}
      </option>
    ))}
  </optgroup>
));
const EQUIPMENT_OPTIONS = usedEquipment.map((q) => (
  <option key={q} value={q}>
    {EQUIPMENT_LABEL[q]}
  </option>
));
const CATEGORY_OPTIONS = usedCategories.map((c) => (
  <option key={c} value={c}>
    {CATEGORY_LABEL[c]}
  </option>
));
const DIFFICULTY_OPTIONS = (Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => (
  <option key={d} value={d}>
    {DIFFICULTY_LABEL[d]}
  </option>
));

/** A filter dropdown bound to one key of the library filters; empty means "any". */
function FilterSelect({ filterKey, label, anyLabel, children }: { filterKey: keyof ExerciseFilters; label: string; anyLabel: string; children: ReactNode }) {
  const value = useLibrary((s) => s.filters[filterKey]);
  const setFilter = useLibrary((s) => s.setFilter);
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[12px] text-fog">
      {label}
      <select
        value={value ?? ''}
        onChange={(e) => setFilter(filterKey, (e.target.value || null) as ExerciseFilters[typeof filterKey])}
        className="field !px-2 !py-1.5 !text-[13px]"
      >
        <option value="">{anyLabel}</option>
        {children}
      </select>
    </label>
  );
}

/** Order of the category sections when browsing without a search: the label map's order. */
const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL) as Category[];

type Chip = { key: keyof ExerciseFilters; text: string };

/** One removable chip per active filter. */
const activeChips = (f: ExerciseFilters) =>
  [
    f.muscle && { key: 'muscle', text: MUSCLE_BY_ID[f.muscle].name },
    f.equipment && { key: 'equipment', text: EQUIPMENT_LABEL[f.equipment] },
    f.category && { key: 'category', text: CATEGORY_LABEL[f.category] },
    f.difficulty && { key: 'difficulty', text: DIFFICULTY_LABEL[f.difficulty] },
  ].filter((c): c is Chip => !!c);

function ExerciseRow({ e, current, onPick }: { e: Exercise; current: boolean; onPick?: () => void }) {
  return (
    <li>
      <Link to={`/exercise/${e.id}`} onClick={onPick} aria-current={current ? 'page' : undefined} className="list-item group">
        <span className="block text-[14px] leading-snug">{e.name}</span>
        <span className="block text-[12px] leading-snug opacity-70">
          {capitalise(joinList(mainAreas(e)))}, {joinList(e.equipment.map((q) => lowerFirst(EQUIPMENT_LABEL[q])))}
        </span>
      </Link>
    </li>
  );
}

/** Searchable, filterable exercise library. Without a search it is grouped by category. */
export function ExerciseList({ onPick }: { onPick?: () => void }) {
  const { query, filters, setQuery, setFilter, clear } = useLibrary();
  const results = useMemo(() => searchExercises(query, filters), [query, filters]);
  const current = useMatch('/exercise/:exerciseId')?.params.exerciseId;
  const chips = activeChips(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searching = query.trim() !== '';
  const sections = useMemo(
    () => (searching ? null : CATEGORY_ORDER.map((c) => ({ c, list: results.filter((e) => e.category === c) })).filter((s) => s.list.length)),
    [searching, results],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 px-4 pb-3">
        <div className="flex gap-2">
          <label className="block min-w-0 flex-1">
            <span className="sr-only">Search exercises</span>
            <input
              id="exercise-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises or muscles"
              autoComplete="off"
              className="field"
            />
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="exercise-filters"
            className={`btn-secondary shrink-0 !px-3 ${filtersOpen ? 'bg-hairline' : ''}`}
          >
            Filters{chips.length > 0 && <span className="ml-1.5 rounded-full bg-ivory px-1.5 text-[12px] text-vitrine">{chips.length}</span>}
          </button>
        </div>

        {filtersOpen ? (
          <div id="exercise-filters" className="grid grid-cols-2 gap-2">
            <FilterSelect filterKey="muscle" label="Muscle" anyLabel="Any muscle">
              {MUSCLE_OPTIONS}
            </FilterSelect>
            <FilterSelect filterKey="equipment" label="Equipment" anyLabel="Any equipment">
              {EQUIPMENT_OPTIONS}
            </FilterSelect>
            <FilterSelect filterKey="category" label="Category" anyLabel="Any category">
              {CATEGORY_OPTIONS}
            </FilterSelect>
            <FilterSelect filterKey="difficulty" label="Difficulty" anyLabel="Any level">
              {DIFFICULTY_OPTIONS}
            </FilterSelect>
          </div>
        ) : (
          chips.length > 0 && (
            <ul aria-label="Active filters" className="flex flex-wrap gap-1.5">
              {chips.map(({ key, text }) => (
                <li key={key}>
                  <button type="button" onClick={() => setFilter(key, null)} aria-label={`Remove filter: ${text}`} className="chip !py-0.5">
                    {text}
                    <span aria-hidden className="text-fog">
                      ✕
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}

        <div className="flex items-center justify-between text-[12px] text-fog" aria-live="polite">
          <span>
            {results.length} {results.length === 1 ? 'exercise' : 'exercises'}
          </span>
          {(searching || chips.length > 0) && (
            <button type="button" onClick={clear} className="link">
              Clear all
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Exercises" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
        {results.length === 0 && <p className="px-2 py-3 text-[14px] text-fog">No exercise matches. Try a different name, or clear the filters.</p>}
        {sections ? (
          sections.map(({ c, list }) => (
            <section key={c} className="mb-2">
              <h3 className="sticky top-0 z-10 bg-vitrine/85 px-2 pb-1 pt-2 text-[12px] font-medium text-fog backdrop-blur">
                {CATEGORY_LABEL[c]}
              </h3>
              <ul>
                {list.map((e) => (
                  <ExerciseRow key={e.id} e={e} current={e.id === current} onPick={onPick} />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <ul>
            {results.map((e) => (
              <ExerciseRow key={e.id} e={e} current={e.id === current} onPick={onPick} />
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}
