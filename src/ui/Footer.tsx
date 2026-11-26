import { useT } from '../i18n';
import { useViewer } from '../state/viewer';

/** Disclaimer and the BodyParts3D credit its CC BY 4.0 licence requires. */
export function Footer({ className = '' }: { className?: string }) {
  const { t } = useT();
  // From the loaded model, so it changes when the new body has arrived.
  const note = useViewer((s) => s.meta?.note);
  return (
    <footer className={`text-[12px] leading-snug text-fog ${className}`}>
      {t('Educational only, not medical advice.')} {t('Model:')}{' '}
      <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer" className="link">
        BodyParts3D © DBCLS
      </a>
      ,{' '}
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="link">
        CC BY 4.0
      </a>
      , {t('modified')}
      {note && `; ${t(note)}`}.
    </footer>
  );
}
