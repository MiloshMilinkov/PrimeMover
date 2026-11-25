import { useEffect, useRef } from 'react';
import { MUSCLE_BY_ID } from '../data/muscles';
import { capitalise } from '../lib/text';
import { useViewer, type Side } from '../state/viewer';

const sideLabel = (side: Side) => (side === 'center' ? '' : side);

/** Follows the pointer over the model: muscle name and side, or the bone name. */
export function HoverTooltip() {
  const hover = useViewer((s) => s.hover);
  const meta = useViewer((s) => s.meta);
  const ref = useRef<HTMLDivElement>(null);

  // Position comes straight from pointer events, so moving within one muscle never re-renders.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const flipX = e.clientX > window.innerWidth / 2 ? 'calc(-100% - 16px)' : '16px';
      const flipY = e.clientY > window.innerHeight / 2 ? 'calc(-100% - 16px)' : '16px';
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(${flipX}, ${flipY})`;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  let title = '';
  let detail = '';
  if (hover && meta) {
    if (hover.kind === 'muscle') {
      const slot = meta.slots[hover.slot];
      title = slot?.id ? MUSCLE_BY_ID[slot.id].name : (slot?.name ?? '');
      detail = [sideLabel(slot?.side ?? 'center'), slot?.id ? 'click for details' : ''].filter(Boolean).join(', ');
    } else {
      const part = meta.parts[hover.part];
      title = part?.name ?? '';
      detail = [sideLabel(part?.side ?? 'center'), 'bone'].filter(Boolean).join(' ');
    }
  }

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      hidden={!title}
      className="glass pointer-events-none fixed left-0 top-0 z-30 max-w-[240px] rounded-xl px-3 py-2"
    >
      <div className="text-[14px] font-medium leading-tight">{capitalise(title)}</div>
      {detail && <div className="mt-0.5 text-[12px] text-fog">{capitalise(detail)}</div>}
    </div>
  );
}
