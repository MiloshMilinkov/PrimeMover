import { useId, useRef, useState, type ReactNode } from 'react';
import { changeLanguage, msg, useT } from '../i18n';
import { useSettings, type Lang, type Theme } from '../state/settings';
import { useViewer, type Quality } from '../state/viewer';
import { Segmented } from './Segmented';
import { useDismiss } from './useDismiss';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'original', label: msg('Original') },
  { value: 'light', label: msg('Light') },
  { value: 'dark', label: msg('Dark') },
];
/** Language names are shown in their own language; they have no dictionary entry, so t() leaves them as they are. */
const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'sr', label: 'Srpski' },
];
const QUALITIES: { value: Quality; label: string }[] = [
  { value: 'high', label: msg('detail::High') },
  { value: 'low', label: msg('detail::Low') },
];

function GearIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7" />
    </svg>
  );
}

/** Theme, language and model detail, behind one button in the top bar. */
export function SettingsMenu() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const lang = useSettings((s) => s.lang);
  const quality = useViewer((s) => s.quality);
  const setQuality = useViewer((s) => s.setQuality);

  useDismiss(open, setOpen, root);
  const row = (label: string, control: ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] text-fog">{label}</span>
      {control}
    </div>
  );

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('Display and language')}
        className="pill glass grid h-[34px] w-[34px] place-items-center p-0"
      >
        <GearIcon />
      </button>
      {open && (
        <div id={panelId} role="dialog" aria-label={t('Display and language')} className="glass absolute right-0 top-11 z-40 flex w-[264px] flex-col gap-4 p-4">
          {row(t('Theme'), <Segmented label={t('Theme')} options={THEMES} value={theme} onChange={setTheme} className="[&>button]:flex-1" />)}
          {row(t('Language'), <Segmented label={t('Language')} options={LANGS} value={lang} onChange={(l) => void changeLanguage(l)} className="[&>button]:flex-1" />)}
          {row(
            t('Model detail'),
            <Segmented label={t('Model detail')} options={QUALITIES} value={quality} onChange={setQuality} className="[&>button]:flex-1" />,
          )}
          <p className="text-[12px] leading-snug text-fog">{t('Low detail loads faster on slower phones and laptops.')}</p>
        </div>
      )}
    </div>
  );
}
