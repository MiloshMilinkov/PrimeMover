import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { SHEET_PEEK, useWindowSize } from './layout';

type Snap = 'peek' | 'half' | 'full';
const SNAPS: Snap[] = ['peek', 'half', 'full'];
const SPRING = { type: 'spring', stiffness: 380, damping: 38 } as const;

const fullHeight = (vh: number) => Math.round(vh * 0.86);
const snapHeight = (snap: Snap, vh: number) =>
  snap === 'peek' ? SHEET_PEEK : snap === 'half' ? Math.round(vh * 0.5) : fullHeight(vh);

/** Mobile panel with three snap heights. The model stays full-screen behind it. */
export function BottomSheet({
  title,
  children,
  snapTo,
  onCoverChange,
}: {
  title: ReactNode;
  children: ReactNode;
  snapTo?: Snap;
  /** Screen height the sheet covers at its current snap. */
  onCoverChange?: (px: number) => void;
}) {
  const { height: vh } = useWindowSize();
  const [snap, setSnap] = useState<Snap>(snapTo ?? 'peek');
  useEffect(() => {
    onCoverChange?.(snapHeight(snap, vh));
  }, [snap, vh, onCoverChange]);
  const full = fullHeight(vh);
  const y = useMotionValue(full - snapHeight(snap, vh));

  // Follow snapTo when it changes (adjusting state during render, not in an effect).
  const [prevSnapTo, setPrevSnapTo] = useState(snapTo);
  if (snapTo !== prevSnapTo) {
    setPrevSnapTo(snapTo);
    if (snapTo) setSnap(snapTo);
  }

  useEffect(() => {
    const controls = animate(y, fullHeight(vh) - snapHeight(snap, vh), SPRING);
    return () => controls.stop();
  }, [y, snap, vh]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const visible = full - y.get() - info.velocity.y * 0.15;
    const nearest = SNAPS.reduce((a, b) => (Math.abs(snapHeight(a, vh) - visible) < Math.abs(snapHeight(b, vh) - visible) ? a : b));
    // Animate even when the snap is unchanged (a short drag springs back).
    if (nearest === snap) animate(y, full - snapHeight(nearest, vh), SPRING);
    else setSnap(nearest);
  };

  return (
    <motion.section
      aria-label="Details"
      className="glass absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-b-none"
      style={{ height: full, y }}
      drag="y"
      dragConstraints={{ top: 0, bottom: full - SHEET_PEEK }}
      dragElastic={0.06}
      dragMomentum={false}
      onDragEnd={onDragEnd}
    >
      <button
        type="button"
        onClick={() => setSnap(snap === 'peek' ? 'half' : snap === 'half' ? 'full' : 'peek')}
        aria-label={snap === 'full' ? 'Collapse panel' : 'Expand panel'}
        className="mx-auto mt-2 flex h-6 w-16 shrink-0 items-center justify-center"
      >
        <span className="h-1 w-10 rounded-full bg-hairline-strong" />
      </button>
      <div className="shrink-0 px-4 pb-2">{title}</div>
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(16px,env(safe-area-inset-bottom))]"
        onPointerDownCapture={(e) => snap === 'full' && e.stopPropagation()}
      >
        {children}
      </div>
    </motion.section>
  );
}
