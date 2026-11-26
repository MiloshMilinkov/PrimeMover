import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MUSCLE_GROUP_LABEL, MUSCLE_GROUP_ORDER } from '../data/labels';
import { MUSCLES } from '../data/muscles';
import { useT } from '../i18n';
import { fold } from '../lib/text';
import { useViewer } from '../state/viewer';
import { ListFrame, type ListProps } from './ListFrame';
import { usePreviewProps } from './preview';

/**
 * Every muscle, grouped by region. This is also the keyboard and screen-reader
 * route to everything clicking the model does.
 */
export function MuscleList({ onPick, inSheet = false, top, onSearchFocus }: ListProps) {
  const { t } = useT();
  const [query, setQuery] = useState('');
  const selected = useViewer((s) => s.selected);
  const goTo = useViewer((s) => s.goTo);
  const preview = usePreviewProps();

  const groups = useMemo(() => {
    const q = fold(query.trim());
    const match = (m: (typeof MUSCLES)[number]) =>
      !q || [m.name, t(m.name), m.latinName, ...(m.parent ? [m.parent, t(m.parent)] : [])].some((s) => fold(s).includes(q));
    return MUSCLE_GROUP_ORDER.map((g) => ({ group: g, muscles: MUSCLES.filter((m) => m.group === g && match(m)) })).filter(
      (g) => g.muscles.length,
    );
  }, [query, t]);

  const header = (
    <>
      {top}
      <label className="block">
        <span className="sr-only">{t('Find a muscle')}</span>
        <input
          id="muscle-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onSearchFocus}
          placeholder={t('Find a muscle')}
          autoComplete="off"
          className="field"
        />
      </label>
    </>
  );

  return (
    <ListFrame header={header} label={t('Muscles')} inSheet={inSheet}>
        {groups.length === 0 && <p className="px-2 py-3 text-[14px] text-fog">{t('No muscle matches “{query}”. Try another name, or the Latin one.', { query })}</p>}
        {groups.map(({ group, muscles }) => (
          <section key={group} className="mb-2">
            <h3 className="px-2 pb-1 pt-2 text-[12px] font-medium text-fog">{t(MUSCLE_GROUP_LABEL[group])}</h3>
            <ul>
              {muscles.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/muscle/${m.id}`}
                    onClick={() => {
                      goTo(m.view);
                      onPick?.();
                    }}
                    {...preview(m.id)}
                    aria-current={m.id === selected ? 'page' : undefined}
                    className="list-item text-[14px] leading-snug"
                  >
                    {t(m.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </ListFrame>
  );
}
