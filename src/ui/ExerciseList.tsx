import { useMemo, useState, type ReactNode } from 'react';
import { Link, useMatch } from 'react-router';
import { categoriesOf, EXERCISES } from '../data/exercises';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, EQUIPMENT_LABEL, MUSCLE_GROUP_LABEL, MUSCLE_GROUP_ORDER } from '../data/labels';
import { MUSCLE_BY_ID, MUSCLES } from '../data/muscles';
import type { Category, Difficulty, Exercise } from '../data/schema';
import { mainAreas } from '../lib/areas';
import { searchExercises, type ExerciseFilters } from '../lib/search';
import { useT, type Translator } from '../i18n';
import { capitalise, lowerFirst } from '../lib/text';
import { useLibrary } from '../state/library';
import { ListFrame, type ListProps } from './ListFrame';

const usedEquipment = [...new Set(EXERCISES.flatMap((e) => e.equipment))];
const usedCategories = [...new Set(EXERCISES.flatMap(categoriesOf))];

/** Filter options in the current language, sorted where the order is alphabetical. */
function filterOptions({ t, lang }: Translator) {
  const byText = (a: string, b: string) => a.localeCompare(b, lang);
  const option = (value: string, text: string) => (
    <option key={value} value={value}>
      {text}
    </option>
  );
  return {
    // Every muscle, grouped by region.
    muscle: MUSCLE_GROUP_ORDER.map((g) => (
      <optgroup key={g} label={t(MUSCLE_GROUP_LABEL[g])}>
        {MUSCLES.filter((m) => m.group === g).map((m) => option(m.id, t(m.name)))}
      </optgroup>
    )),
    equipment: usedEquipment
      .map((q) => [q, t(EQUIPMENT_LABEL[q])] as const)
      .sort((a, b) => byText(a[1], b[1]))
      .map(([q, text]) => option(q, text)),
    category: usedCategories.map((c) => option(c, t(CATEGORY_LABEL[c]))),
    difficulty: (Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => option(d, t(DIFFICULTY_LABEL[d]))),
  };
}

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
  const { t, list } = useT();
  return (
    <li>
      <Link to={`/exercise/${e.id}`} onClick={onPick} aria-current={current ? 'page' : undefined} className="list-item group">
        <span className="block text-[14px] leading-snug">{t(e.name)}</span>
        <span className="block text-[12px] leading-snug opacity-70">
          {capitalise(list(mainAreas(e).map((a) => t(a))))}, {list(e.equipment.map((q) => lowerFirst(t(EQUIPMENT_LABEL[q]))))}
        </span>
      </Link>
    </li>
  );
}

/** Searchable, filterable exercise library. Without a search it is grouped by category. */
export function ExerciseList({ onPick, inSheet = false, top, intro, onSearchFocus }: ListProps) {
  const tr = useT();
  const { t, n, lang } = tr;
  const options = useMemo(() => filterOptions(tr), [tr]);
  const { query, filters, setQuery, setFilter, clear } = useLibrary();
  const results = useMemo(() => searchExercises(query, filters, lang), [query, filters, lang]);
  const current = useMatch('/exercise/:exerciseId')?.params.exerciseId;
  const chips = activeChips(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searching = query.trim() !== '';
  const sections = useMemo(
    () => (searching ? null : CATEGORY_ORDER.map((c) => ({ c, items: results.filter((e) => e.category === c) })).filter((s) => s.items.length)),
    [searching, results],
  );

  const header = (
    <>
      {top}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <label className="block min-w-0 flex-1">
            <span className="sr-only">{t('Search exercises')}</span>
            <input
              id="exercise-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={onSearchFocus}
              placeholder={t('Search exercises or muscles')}
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
            {t('Filters')}
            {chips.length > 0 && <span className="ml-1.5 rounded-full bg-ivory px-1.5 text-[12px] text-vitrine">{chips.length}</span>}
          </button>
        </div>

        {filtersOpen ? (
          <div id="exercise-filters" className="grid grid-cols-2 gap-2">
            <FilterSelect filterKey="muscle" label={t('Muscle')} anyLabel={t('Any muscle')}>
              {options.muscle}
            </FilterSelect>
            <FilterSelect filterKey="equipment" label={t('Equipment')} anyLabel={t('Any equipment')}>
              {options.equipment}
            </FilterSelect>
            <FilterSelect filterKey="category" label={t('Category')} anyLabel={t('Any category')}>
              {options.category}
            </FilterSelect>
            <FilterSelect filterKey="difficulty" label={t('Difficulty')} anyLabel={t('Any level')}>
              {options.difficulty}
            </FilterSelect>
          </div>
        ) : (
          chips.length > 0 && (
            <ul aria-label={t('Active filters')} className="flex flex-wrap gap-1.5">
              {chips.map(({ key, text }) => (
                <li key={key}>
                  <button type="button" onClick={() => setFilter(key, null)} aria-label={t('Remove filter: {name}', { name: t(text) })} className="chip !py-0.5">
                    {t(text)}
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
            {n(results.length, '{n} exercise', '{n} exercises')}
          </span>
          {(searching || chips.length > 0) && (
            <button type="button" onClick={clear} className="link">
              {t('Clear all')}
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <ListFrame header={header} label={t('Exercises')} inSheet={inSheet}>
        {!searching && intro && <div className="mb-4 px-2">{intro}</div>}
        {results.length === 0 && <p className="px-2 py-3 text-[14px] text-fog">{t('No exercise matches. Try a different name, or clear the filters.')}</p>}
        {sections ? (
          sections.map(({ c, items }) => (
            <section key={c} className="mb-2">
              {/* In the sheet the search header is the sticky part; section titles scroll with the list. */}
              <h3 className={`px-2 pb-1 pt-2 text-[12px] font-medium text-fog ${inSheet ? '' : 'sticky top-0 z-10 bg-vitrine/85 backdrop-blur'}`}>
                {t(CATEGORY_LABEL[c])}
              </h3>
              <ul>
                {items.map((e) => (
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
    </ListFrame>
  );
}
