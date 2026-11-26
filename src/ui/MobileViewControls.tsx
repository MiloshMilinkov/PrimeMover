import { useId, useRef, useState } from 'react';
import { useT } from '../i18n';
import { LayerControls } from './LayerControls';
import { useDismiss } from './useDismiss';

function LayersIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M10 2.5 2.5 6.5 10 10.5l7.5-4L10 2.5Z" />
      <path d="m2.5 10 7.5 4 7.5-4" />
      <path d="m2.5 13.5 7.5 4 7.5-4" />
    </svg>
  );
}

/**
 * Phones: the layer and depth switches behind one round button that floats just above
 * the sheet, so the sheet header stays short and the body keeps the screen.
 */
export function MobileViewControls({ bottom }: { bottom: number }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

  useDismiss(open, setOpen, root);

  return (
    <div ref={root} className="absolute right-4 z-20 flex flex-col items-end gap-2" style={{ bottom }}>
      {open && (
        <div id={id} role="dialog" aria-label={t('Layers')} className="glass w-[min(340px,calc(100vw-32px))] p-2">
          <LayerControls />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={t('Layers')}
        className={`glass grid h-11 w-11 place-items-center rounded-full transition-colors ${open ? 'bg-ivory text-vitrine' : 'text-ivory'}`}
      >
        <LayersIcon />
      </button>
    </div>
  );
}
