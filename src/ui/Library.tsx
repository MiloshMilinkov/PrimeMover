import { useLibrary, type LibraryTab } from '../state/library';
import { ExerciseList } from './ExerciseList';
import { MuscleList } from './MuscleList';
import { Segmented } from './Segmented';

const TABS: { value: LibraryTab; label: string }[] = [
  { value: 'exercises', label: 'Exercises' },
  { value: 'muscles', label: 'Muscles' },
];

/** The browse panel: exercises or muscles, each with its own search. */
export function Library({ onPick }: { onPick?: () => void }) {
  const tab = useLibrary((s) => s.tab);
  const setTab = useLibrary((s) => s.setTab);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Segmented label="Browse" options={TABS} value={tab} onChange={setTab} className="mx-4 mb-3 [&>button]:flex-1" />
      {tab === 'exercises' ? <ExerciseList onPick={onPick} /> : <MuscleList onPick={onPick} />}
    </div>
  );
}
