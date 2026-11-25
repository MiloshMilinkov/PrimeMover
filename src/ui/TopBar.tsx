import type { Ref } from 'react';
import { Link } from 'react-router';
import { useViewer } from '../state/viewer';
import { VIEWS } from './views';

/** Toggle for the lighter model and lower pixel ratio. */
export function QualityToggle({ className = '' }: { className?: string }) {
  const quality = useViewer((s) => s.quality);
  const setQuality = useViewer((s) => s.setQuality);
  return (
    <button
      type="button"
      onClick={() => setQuality(quality === 'high' ? 'low' : 'high')}
      aria-pressed={quality === 'low'}
      className={`pill glass ${quality === 'low' ? 'bg-ivory text-vitrine hover:text-vitrine' : ''} ${className}`}
    >
      Low quality
    </button>
  );
}

export function TopBar({ ref }: { ref?: Ref<HTMLElement> }) {
  const goTo = useViewer((s) => s.goTo);

  return (
    <header ref={ref} className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 pt-3 md:px-6 md:pt-4">
      <Link to="/" className="pointer-events-auto flex items-baseline gap-2 rounded-md text-ivory">
        <span className="text-[17px] font-semibold tracking-[-0.01em]">HowWeMove</span>
        <span className="latin hidden text-[15px] text-fog sm:inline">anatomy in motion</span>
      </Link>

      <div className="pointer-events-auto flex items-center gap-2">
        <nav aria-label="Camera view" className="glass flex items-center gap-0.5 rounded-pill p-1">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => goTo(v.value)}
              title={`${v.label} view (${v.key})`}
              className="rounded-control px-2.5 py-1 text-[13px] font-medium text-fog transition-colors hover:bg-hairline hover:text-ivory"
            >
              {v.label}
            </button>
          ))}
        </nav>
        <QualityToggle className="hidden md:block" />
      </div>
    </header>
  );
}
