import type { ReactNode, Ref } from 'react';
import { Link } from 'react-router';
import { msg, useT } from '../i18n';
import { useViewer, type BodyType } from '../state/viewer';
import { Segmented } from './Segmented';
import { SettingsMenu } from './SettingsMenu';
import { VIEWS } from './views';

const BODIES: { value: BodyType; label: string }[] = [
  { value: 'male', label: msg('Male') },
  { value: 'female', label: msg('Female') },
];

/**
 * Male or female body. Wide screens get both options; phones get one button that
 * shows the current body and switches on tap, to fit beside the views.
 */
function BodySwitch() {
  const { t } = useT();
  const body = useViewer((s) => s.body);
  const setBody = useViewer((s) => s.setBody);
  const current = BODIES.find((b) => b.value === body)!;
  const other = BODIES.find((b) => b.value !== body)!;
  return (
    <>
      <Segmented label={t('Body')} options={BODIES} value={body} onChange={setBody} className="glass hidden rounded-pill p-1 md:flex [&>button]:!py-1" />
      <button
        type="button"
        onClick={() => setBody(other.value)}
        aria-label={t('Body: {current}. Switch to {other}', { current: t(current.label), other: t(other.label) })}
        className="pill glass md:hidden"
      >
        {t(current.label)}
      </button>
    </>
  );
}

/** `children` render under the bar (the mobile legend), inside the space the camera keeps clear. */
export function TopBar({ ref, children }: { ref?: Ref<HTMLElement>; children?: ReactNode }) {
  const { t } = useT();
  const goTo = useViewer((s) => s.goTo);

  return (
    <header ref={ref} className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-4 pt-3 md:px-6 md:pt-4">
      <div className="flex items-center justify-between gap-2">
        {/* Phones show only the icon, to leave room for the controls. */}
        <Link to="/" aria-label="Prime Mover" className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-md text-ivory">
          <img src="/favicon.svg" alt="" width={28} height={28} className="sm:hidden" />
          <span className="hidden items-baseline gap-2 sm:flex">
            <span className="text-[17px] font-semibold tracking-[-0.01em]">Prime Mover</span>
            <span className="latin hidden text-[15px] text-fog md:inline">{t('the anatomy of every exercise')}</span>
          </span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          <BodySwitch />
          <nav aria-label={t('Camera view')} className="glass flex items-center gap-0.5 rounded-pill p-1">
            {VIEWS.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => goTo(v.value)}
                aria-keyshortcuts={v.key}
                className="rounded-control px-2.5 py-1.5 text-[13px] font-medium text-fog transition-colors hover:bg-hairline hover:text-ivory md:py-1"
              >
                {t(v.label)}
              </button>
            ))}
          </nav>
          <SettingsMenu />
        </div>
      </div>
      {children}
    </header>
  );
}
