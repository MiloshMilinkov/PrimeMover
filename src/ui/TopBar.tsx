import type { ReactNode, Ref } from 'react';
import { Link } from 'react-router';
import { useViewer, type BodyType } from '../state/viewer';
import { Segmented } from './Segmented';
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

const BODIES: { value: BodyType; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

/**
 * Male or female body. Wide screens get both options; phones get one button that
 * shows the current body and switches on tap, to fit beside the views.
 */
function BodySwitch() {
  const body = useViewer((s) => s.body);
  const setBody = useViewer((s) => s.setBody);
  const other = BODIES.find((b) => b.value !== body)!.value;
  return (
    <>
      <Segmented label="Body" options={BODIES} value={body} onChange={setBody} className="glass hidden rounded-pill p-1 md:flex [&>button]:!py-1" />
      <button
        type="button"
        onClick={() => setBody(other)}
        aria-label={`Body: ${body}. Switch to ${other}`}
        className="pill glass md:hidden"
      >
        {BODIES.find((b) => b.value === body)!.label}
      </button>
    </>
  );
}

/** `children` render under the bar (the mobile legend), inside the space the camera keeps clear. */
export function TopBar({ ref, children }: { ref?: Ref<HTMLElement>; children?: ReactNode }) {
  const goTo = useViewer((s) => s.goTo);

  return (
    <header ref={ref} className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-4 pt-3 md:px-6 md:pt-4">
      <div className="flex items-center justify-between gap-3">
      <Link to="/" className="pointer-events-auto flex items-baseline gap-2 rounded-md text-ivory">
        <span className="text-[17px] font-semibold tracking-[-0.01em]">Prime Mover</span>
        <span className="latin hidden text-[15px] text-fog sm:inline">the anatomy of every exercise</span>
      </Link>

      <div className="pointer-events-auto flex items-center gap-2">
        <BodySwitch />
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
      </div>
      {children}
    </header>
  );
}
