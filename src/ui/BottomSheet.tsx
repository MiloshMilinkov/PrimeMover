import { animate, motion, useDragControls, useMotionValue, type PanInfo } from 'framer-motion';
import { useEffect, useState, type PointerEvent, type ReactNode } from 'react';
import { useT } from '../i18n';
import { useWindowSize } from './layout';

export type Snap = 'peek' | 'half' | 'full';
const SNAPS: Snap[] = ['peek', 'half', 'full'];
const SPRING = { type: 'spring', stiffness: 380, damping: 38 } as const;

/**
 * Mobile panel with three snap heights over the full-screen model.
 * Only the top strip (handle and `header`) drags the sheet, so lists inside it scroll
 * normally. `request` moves it to a snap; a new `n` repeats the same snap.
 */
export function BottomSheet({
  header,
  children,
  peek,
  request,
  onCoverChange,
}: {
  header?: ReactNode;
  children: ReactNode;
  /** Height of the lowest snap: enough to show the header and what must stay reachable. */
  peek: number;
  request: { snap: Snap; n: number };
  /** Screen height the sheet covers at its current snap. */
  onCoverChange?: (px: number) => void;
}) {
  const { height: vh } = useWindowSize();
  const { t } = useT();
  const drag = useDragControls();
  const [snap, setSnap] = useState<Snap>(request.snap);
  const full = Math.round(vh * 0.9);
  const heights: Record<Snap, number> = { peek, half: Math.round(vh * 0.52), full };
  const cover = heights[snap];
  const y = useMotionValue(full - cover);

  // Follow requests (adjusting state during render, not in an effect).
  const [seen, setSeen] = useState(request.n);
  if (request.n !== seen) {
    setSeen(request.n);
    setSnap(request.snap);
  }

  useEffect(() => {
    onCoverChange?.(cover);
    const controls = animate(y, full - cover, SPRING);
    return () => controls.stop();
  }, [cover, full, y, onCoverChange]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const visible = full - y.get() - info.velocity.y * 0.15;
    const nearest = SNAPS.reduce((a, b) => (Math.abs(heights[a] - visible) < Math.abs(heights[b] - visible) ? a : b));
    // Animate even when the snap is unchanged (a short drag springs back).
    if (nearest === snap) animate(y, full - heights[nearest], SPRING);
    else setSnap(nearest);
  };

  // Drag from the strip, but let its buttons and links be tapped.
  const startDrag = (e: PointerEvent) => {
    if (!(e.target as HTMLElement).closest('button, a, input')) drag.start(e);
  };

  return (
    <motion.section
      aria-label={t('Details')}
      className="glass absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-b-none"
      style={{ height: full, y }}
      drag="y"
      dragControls={drag}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: full - peek }}
      dragElastic={0.06}
      dragMomentum={false}
      onDragEnd={onDragEnd}
    >
      <div onPointerDown={startDrag} className="shrink-0 touch-none select-none px-4">
        <button
          type="button"
          onClick={() => setSnap(snap === 'peek' ? 'half' : snap === 'half' ? 'full' : 'peek')}
          aria-label={snap === 'full' ? t('Collapse panel') : t('Expand panel')}
          className="mx-auto flex h-7 w-full items-center justify-center"
        >
          <span className="h-1 w-10 rounded-full bg-hairline-strong" />
        </button>
        {header}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(16px,env(safe-area-inset-bottom))]">{children}</div>
    </motion.section>
  );
}
