import { useMemo, type ReactNode } from 'react';
import { Link, useMatch } from 'react-router';
import { categoriesOf, EXERCISES } from '../data/exercises';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, EQUIPMENT_LABEL, MUSCLE_GROUP_LABEL, MUSCLE_GROUP_ORDER } from '../data/labels';
import { MUSCLES } from '../data/muscles';
import type { Difficulty } from '../data/schema';
import { searchExercises, type ExerciseFilters } from '../lib/search';
import { joinList, lowerFirst } from '../lib/text';
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

/** Searchable, filterable exercise library. */
export function ExerciseList({ onPick }: { onPick?: () => void }) {
  const { query, filters, setQuery, clear } = useLibrary();
  const results = useMemo(() => searchExercises(query, filters), [query, filters]);
  const current = useMatch('/exercise/:exerciseId')?.params.exerciseId;
  const filtered = query !== '' || Object.values(filters).some(Boolean);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 px-4 pb-3">
        <label className="block">
          <span className="sr-only">Search exercises</span>
          <input
            id="exercise-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. RDL or pull-up vs chin-up"
            autoComplete="off"
            className="field"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
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
        <div className="flex items-center justify-between text-[12px] text-fog" aria-live="polite">
          <span>
            {results.length} {results.length === 1 ? 'exercise' : 'exercises'}
          </span>
          {filtered && (
            <button type="button" onClick={clear} className="link">
              Clear search and filters
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Exercises" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
        {results.length === 0 && <p className="px-2 py-3 text-[14px] text-fog">No exercise matches. Try a different name, or clear the filters.</p>}
        <ul>
          {results.map((e) => (
            <li key={e.id}>
              <Link to={`/exercise/${e.id}`} onClick={onPick} aria-current={e.id === current ? 'page' : undefined} className="list-item group">
                <span className="block text-[14px] leading-snug">{e.name}</span>
                <span className="block text-[12px] leading-snug opacity-70">
                  {CATEGORY_LABEL[e.category]}, {joinList(e.equipment.map((q) => lowerFirst(EQUIPMENT_LABEL[q])))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
