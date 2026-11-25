import { useViewer, type Depth, type LayerMode } from '../state/viewer';
import { Segmented } from './Segmented';

const MODES: { value: LayerMode; label: string }[] = [
  { value: 'full', label: 'Body' },
  { value: 'muscles', label: 'Muscles' },
  { value: 'skeleton', label: 'Skeleton' },
  { value: 'xray', label: 'X-ray' },
];

const DEPTHS: { value: Depth; label: string }[] = [
  { value: 0, label: 'All layers' },
  { value: 1, label: 'Peel outer' },
  { value: 2, label: 'Deep only' },
];

/** Layer and depth switches. Bare by default; the caller adds any panel styling. */
export function LayerControls({ className = '' }: { className?: string }) {
  const layerMode = useViewer((s) => s.layerMode);
  const depth = useViewer((s) => s.depth);
  const setLayerMode = useViewer((s) => s.setLayerMode);
  const setDepth = useViewer((s) => s.setDepth);
  const musclesShown = layerMode !== 'skeleton';

  return (
    <div className={`flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <Segmented label="Layers" options={MODES} value={layerMode} onChange={setLayerMode} />
      <span aria-hidden className="mx-1 hidden h-5 w-px bg-hairline-strong sm:block" />
      <Segmented
        label="Muscle depth"
        options={DEPTHS}
        value={depth}
        onChange={setDepth}
        className={musclesShown ? '' : 'pointer-events-none opacity-40'}
      />
    </div>
  );
}
