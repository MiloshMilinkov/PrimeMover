import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useMatch, useNavigate, useSearchParams } from 'react-router';
import { EXERCISE_BY_ID } from './data/exercises';
import { currentTranslator, useT } from './i18n';
import { MUSCLE_BY_ID } from './data/muscles';
import type { MuscleId } from './data/schema';
import { useViewer } from './state/viewer';
import { Scene } from './three/Scene';
import { BottomSheet, type Snap } from './ui/BottomSheet';
import { DESKTOP_QUERY, WIDE_QUERY } from './ui/breakpoints';
import { Footer } from './ui/Footer';
import { HoverTooltip } from './ui/HoverTooltip';
import { LayerControls } from './ui/LayerControls';
import { PANEL_WIDTH, RAIL_WIDTH, SHEET_PEEK_BROWSE, SHEET_PEEK_DETAIL, useInsetTracking, useMediaQuery, useWindowSize } from './ui/layout';
import { LoadingScreen } from './ui/LoadingScreen';
import { MuscleDetails, PlateCaption } from './ui/MuscleDetails';
import { ExercisePanel } from './ui/ExercisePanel';
import { Legend } from './ui/Legend';
import { MobileViewControls } from './ui/MobileViewControls';
import { Library } from './ui/Library';
import { TopBar } from './ui/TopBar';
import { VIEWS } from './ui/views';
import { Welcome } from './ui/Welcome';

class ModelErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const { t } = currentTranslator();
    return (
      <div role="alert" className="absolute inset-0 grid place-items-center p-6 text-center">
        <div className="max-w-sm">
          <p className="text-[17px] font-medium">{t('The 3D model didn’t load.')}</p>
          <p className="mt-1 text-[14px] text-fog">{t('Check your connection, then reload the page. If it keeps failing, switch to low detail in the settings.')}</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-4">
            {t('Reload')}
          </button>
        </div>
      </div>
    );
  }
}

/**
 * Route state: /muscle/:id, or /exercise/:id with an optional ?m=<muscle> focus.
 * Syncs the store, frames the exercise's working muscles, and sets the page title.
 */
function useRouteState() {
  const { t } = useT();
  const muscleMatch = useMatch('/muscle/:muscleId');
  const exerciseMatch = useMatch('/exercise/:exerciseId');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const exercise = exerciseMatch ? EXERCISE_BY_ID[exerciseMatch.params.exerciseId ?? ''] : undefined;
  const rawMuscle = muscleMatch?.params.muscleId ?? (exercise ? params.get('m') : null);
  const muscle = rawMuscle && rawMuscle in MUSCLE_BY_ID ? (rawMuscle as MuscleId) : null;
  const invalid = (muscleMatch && !muscle) || (exerciseMatch && !exercise);

  useEffect(() => {
    if (invalid) navigate('/', { replace: true });
  }, [invalid, navigate]);

  const onMusclePage = !!muscleMatch;
  const firstLoad = useRef(true);
  useEffect(() => {
    const viewer = useViewer.getState();
    viewer.setSelected(muscle);
    // A muscle page opened from a link starts facing the muscle. Later, the muscle list turns the body
    // (MuscleList); a click on the body does not, since that muscle is already in view.
    if (firstLoad.current && onMusclePage && muscle) viewer.goTo(MUSCLE_BY_ID[muscle].view);
    firstLoad.current = false;
  }, [muscle, onMusclePage]);

  useEffect(() => {
    const { setExercise, frameExercise } = useViewer.getState();
    setExercise(exercise?.id ?? null);
    if (exercise) frameExercise(exercise);
  }, [exercise]);

  const name = exercise ? t(exercise.name) : muscle ? t(MUSCLE_BY_ID[muscle].name) : null;
  useEffect(() => {
    document.title = name ? `${name} | Prime Mover` : 'Prime Mover';
  }, [name]);

  return { exercise: exercise ?? null, muscle, name };
}

function useShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable="true"]') || e.metaKey || e.ctrlKey || e.altKey) return;
      const view = VIEWS.find((v) => v.key === e.key);
      if (view) useViewer.getState().goTo(view.value);
      else if (e.key === 'Escape') navigate('/');
      else if (e.key === '/') {
        e.preventDefault();
        (document.getElementById('exercise-search') ?? document.getElementById('muscle-search'))?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
}

export default function App() {
  const { t } = useT();
  const { exercise, muscle, name } = useRouteState();
  useShortcuts();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const wide = useMediaQuery(WIDE_QUERY);
  const [railOpen, setRailOpen] = useState(false);
  const railVisible = desktop && (wide || railOpen);
  const { height: vh } = useWindowSize();
  const [sheetCover, setSheetCover] = useState(SHEET_PEEK_BROWSE);
  // A fully open sheet hides the body anyway; frame as if it were half open.
  const track = useInsetTracking(desktop ? 0 : Math.min(sheetCover, vh / 2));
  const insets = useViewer((s) => s.insets);

  // Mobile sheet: opening an exercise or muscle, or going back to the list, brings it to
  // half height; a deep link starts there too. A tap in the search opens it fully.
  const routeKey = exercise ? `e:${exercise.id}:${muscle ?? ''}` : muscle ? `m:${muscle}` : '';
  const [sheetRequest, setSheetRequest] = useState<{ snap: Snap; n: number }>({ snap: routeKey ? 'half' : 'peek', n: 0 });
  const requestSheet = useCallback((snap: Snap) => setSheetRequest((r) => ({ snap, n: r.n + 1 })), []);
  const lastRoute = useRef(routeKey);
  useEffect(() => {
    if (lastRoute.current === routeKey) return;
    lastRoute.current = routeKey;
    requestSheet('half');
  }, [routeKey, requestSheet]);

  const detail = exercise ? (
    <ExercisePanel exercise={exercise} focus={muscle} titleHidden={!desktop} />
  ) : muscle ? (
    <MuscleDetails id={muscle} titleHidden={!desktop} />
  ) : null;
  const rightPanel = detail ?? <Welcome onBrowse={() => setRailOpen(true)} />;

  return (
    <div
      className="relative h-full w-full overflow-clip"
      style={{
        background: 'radial-gradient(ellipse 55% 65% at 50% 42%, var(--stage-1) 0%, var(--stage-2) 48%, var(--color-vitrine) 78%)',
      }}
    >
      <ModelErrorBoundary>
        <Scene />
      </ModelErrorBoundary>
      <TopBar ref={track('top')}>
        {!desktop && exercise && <Legend compact className="glass pointer-events-auto rounded-pill px-3 py-1.5" />}
      </TopBar>

      {desktop && !wide && (
        <button
          type="button"
          onClick={() => setRailOpen((o) => !o)}
          aria-expanded={railOpen}
          aria-controls="library-rail"
          className="pill glass absolute left-6 top-16 z-20"
        >
          {railOpen ? t('Hide list') : t('Browse')}
        </button>
      )}

      {railVisible && (
        <aside
          ref={track('left')}
          id="library-rail"
          aria-label={t('Exercise and muscle library')}
          className="glass absolute bottom-4 left-6 top-28 z-20 flex flex-col pt-4 wide:top-16"
          style={{ width: RAIL_WIDTH }}
        >
          <Library onPick={() => !wide && setRailOpen(false)} />
        </aside>
      )}

      {desktop && (
        <aside
          ref={track('right')}
          aria-label={exercise ? t('Exercise details') : muscle ? t('Muscle details') : t('Getting started')}
          className="glass absolute bottom-4 right-6 top-16 z-20 overflow-y-auto p-5"
          style={{ width: PANEL_WIDTH }}
        >
          {rightPanel}
        </aside>
      )}

      {desktop && (
        <div
          ref={track('bottom')}
          className="pointer-events-none absolute bottom-2.5 z-20 flex flex-col items-center gap-2 px-4"
          style={{ left: Math.max(0, insets.left - 8), right: Math.max(0, insets.right - 8) }}
        >
          {exercise && <Legend className="glass pointer-events-auto rounded-pill px-3 py-1.5" />}
          <LayerControls className="glass pointer-events-auto p-1.5" />
          <Footer className="pointer-events-auto text-center" />
        </div>
      )}

      {desktop && <PlateCaption />}
      <HoverTooltip />

      {!desktop && (
        <BottomSheet
          peek={detail ? SHEET_PEEK_DETAIL : SHEET_PEEK_BROWSE}
          request={sheetRequest}
          onCoverChange={setSheetCover}
          header={
            detail && (
              <div className="flex items-center gap-3 pb-3">
                <Link to="/" className="btn-secondary flex shrink-0 items-center gap-1 px-3 py-2" aria-label={t('Back to the list')}>
                  <span aria-hidden>‹</span>
                  {t('nav::Back')}
                </Link>
                <p className="min-w-0 flex-1 truncate text-[16px] font-semibold">{name}</p>
              </div>
            )
          }
        >
          {detail ?? <Library inSheet intro={<Welcome compact />} onSearchFocus={() => requestSheet('full')} />}
          <Footer className="mt-6 border-t border-hairline pt-3" />
        </BottomSheet>
      )}

      {/* Hidden while the sheet covers most of the screen. */}
      {!desktop && sheetCover < vh * 0.7 && <MobileViewControls bottom={sheetCover + 12} />}

      <LoadingScreen />
    </div>
  );
}
