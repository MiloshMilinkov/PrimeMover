import { msg, useT } from '../i18n';
import { useLibrary, type LibraryTab } from '../state/library';
import { ExerciseList } from './ExerciseList';
import type { ListProps } from './ListFrame';
import { MuscleList } from './MuscleList';
import { Segmented } from './Segmented';

const TABS: { value: LibraryTab; label: string }[] = [
  { value: 'exercises', label: msg('Exercises') },
  { value: 'muscles', label: msg('Muscles') },
];

/**
 * The browse panel: exercises or muscles, each with its own search. In the mobile
 * sheet (`inSheet`) the tabs and search stick to the top of the sheet's scroll.
 */
export function Library({ onPick, inSheet = false, intro, onSearchFocus }: Omit<ListProps, 'top'>) {
  const { t } = useT();
  const tab = useLibrary((s) => s.tab);
  const setTab = useLibrary((s) => s.setTab);
  const tabs = (
    <Segmented label={t('Browse')} options={TABS} value={tab} onChange={setTab} className="mb-3 [&>button]:flex-1" />
  );
  const props = { onPick, inSheet, top: tabs, onSearchFocus };
  const list = tab === 'exercises' ? <ExerciseList {...props} intro={intro} /> : <MuscleList {...props} />;
  return inSheet ? list : <div className="flex min-h-0 flex-1 flex-col">{list}</div>;
}
