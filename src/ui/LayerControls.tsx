import { useViewer, type Depth, type LayerMode } from '../state/viewer';
import { msg, useT } from '../i18n';
import { Segmented } from './Segmented';

const MODES: { value: LayerMode; label: string }[] = [
  { value: 'full', label: msg('Body') },
  { value: 'muscles', label: msg('Muscles') },
  { value: 'skeleton', label: msg('Skeleton') },
  { value: 'xray', label: msg('X-ray') },
];

const DEPTHS: { value: Depth; label: string }[] = [
  { value: 0, label: msg('All layers') },
  { value: 1, label: msg('Peel outer') },
  { value: 2, label: msg('Deep only') },
];

/** Layer and depth switches. Bare by default; the caller adds any panel styling. */
export function LayerControls({ className = '' }: { className?: string }) {
  const { t } = useT();
  const layerMode = useViewer((s) => s.layerMode);
  const depth = useViewer((s) => s.depth);
  const setLayerMode = useViewer((s) => s.setLayerMode);
  const setDepth = useViewer((s) => s.setDepth);
  const musclesShown = layerMode !== 'skeleton';

  return (
    <div className={`flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <Segmented label={t('Layers')} options={MODES} value={layerMode} onChange={setLayerMode} />
      <span aria-hidden className="mx-1 hidden h-5 w-px bg-hairline-strong sm:block" />
      <Segmented
        label={t('Muscle depth')}
        options={DEPTHS}
        value={depth}
        onChange={setDepth}
        className={musclesShown ? '' : 'pointer-events-none opacity-40'}
      />
    </div>
  );
}
