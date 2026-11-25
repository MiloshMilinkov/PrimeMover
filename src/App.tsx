import { Component, useEffect, useState, type ReactNode } from 'react';
import { useMatch, useNavigate } from 'react-router';
import { MUSCLE_BY_ID } from './data/muscles';
import type { MuscleId } from './data/schema';
import { useViewer } from './state/viewer';
import { Scene } from './three/Scene';
import { BottomSheet } from './ui/BottomSheet';
import { DESKTOP_QUERY, WIDE_QUERY } from './ui/breakpoints';
import { Footer } from './ui/Footer';
import { HoverTooltip } from './ui/HoverTooltip';
import { LayerControls } from './ui/LayerControls';
import { PANEL_WIDTH, RAIL_WIDTH, SHEET_PEEK, useInsetTracking, useMediaQuery } from './ui/layout';
import { LoadingScreen } from './ui/LoadingScreen';
import { MuscleDetails, PlateCaption } from './ui/MuscleDetails';
import { MuscleList } from './ui/MuscleList';
import { QualityToggle, TopBar } from './ui/TopBar';
import { VIEWS } from './ui/views';

class ModelErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="absolute inset-0 grid place-items-center p-6 text-center">
        <div className="max-w-sm">
          <p className="text-[17px] font-medium">The 3D model didn’t load.</p>
          <p className="mt-1 text-[14px] text-fog">Check your connection, then reload the page. If it keeps failing, switch to low quality.</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-4">
            Reload
          </button>
        </div>
      </div>
    );
  }
}

/** Keeps the selected muscle in sync with /muscle/:id and the page title. */
function useRouteSelection() {
  const match = useMatch('/muscle/:muscleId');
  const navigate = useNavigate();
  const raw = match?.params.muscleId;
  const id = raw && raw in MUSCLE_BY_ID ? (raw as MuscleId) : null;
  const setSelected = useViewer((s) => s.setSelected);

  useEffect(() => {
    if (raw && !id) navigate('/', { replace: true });
    setSelected(id);
    document.title = id ? `${MUSCLE_BY_ID[id].name} | HowWeMove` : 'HowWeMove';
  }, [raw, id, navigate, setSelected]);
  return id;
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
        document.getElementById('muscle-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
}

export default function App() {
  const selected = useRouteSelection();
  useShortcuts();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const wide = useMediaQuery(WIDE_QUERY);
  const [railOpen, setRailOpen] = useState(false);
  const railVisible = desktop && (wide || railOpen);
  const track = useInsetTracking(desktop ? 0 : SHEET_PEEK);
  const insets = useViewer((s) => s.insets);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 55% 65% at 50% 42%, #1d2a31 0%, #141e23 48%, var(--color-vitrine) 78%)',
      }}
    >
      <ModelErrorBoundary>
        <Scene />
      </ModelErrorBoundary>
      <TopBar ref={track('top')} />

      {desktop && !wide && (
        <button
          type="button"
          onClick={() => setRailOpen((o) => !o)}
          aria-expanded={railOpen}
          aria-controls="muscle-rail"
          className="pill glass absolute left-6 top-16 z-20"
        >
          {railOpen ? 'Hide muscles' : 'Browse muscles'}
        </button>
      )}

      {railVisible && (
        <aside
          ref={track('left')}
          id="muscle-rail"
          aria-label="Muscle list"
          className="glass absolute bottom-4 left-6 top-28 z-20 flex flex-col pt-4 wide:top-16"
          style={{ width: RAIL_WIDTH }}
        >
          <h2 className="px-4 pb-2 text-[15px] font-semibold">Muscles</h2>
          <MuscleList onPick={() => !wide && setRailOpen(false)} />
        </aside>
      )}

      {desktop && selected && (
        <aside
          ref={track('right')}
          aria-label="Muscle details"
          className="glass absolute bottom-4 right-6 top-16 z-20 overflow-y-auto p-5"
          style={{ width: PANEL_WIDTH }}
        >
          <MuscleDetails id={selected} />
        </aside>
      )}

      {desktop && (
        <div
          ref={track('bottom')}
          className="pointer-events-none absolute bottom-2.5 z-20 flex flex-col items-center gap-2 px-4"
          style={{ left: Math.max(0, insets.left - 8), right: Math.max(0, insets.right - 8) }}
        >
          <LayerControls className="glass pointer-events-auto p-1.5" />
          <Footer className="pointer-events-auto text-center" />
        </div>
      )}

      {desktop && <PlateCaption />}
      <HoverTooltip />

      {!desktop && (
        <BottomSheet
          snapTo={selected ? 'half' : undefined}
          title={
            <div className="flex flex-col gap-2">
              <p className="truncate text-[15px] font-semibold">{selected ? MUSCLE_BY_ID[selected].name : 'Explore the body'}</p>
              <LayerControls />
            </div>
          }
        >
          {selected ? (
            <MuscleDetails id={selected} titleHidden />
          ) : (
            <div className="-mx-4 flex h-[60vh] flex-col">
              <MuscleList />
            </div>
          )}
          <QualityToggle className="mt-6" />
          <Footer className="mt-4 border-t border-hairline pt-3" />
        </BottomSheet>
      )}

      <LoadingScreen />
    </div>
  );
}
