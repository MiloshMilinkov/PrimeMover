import { NEUTRAL_COLOR, patternCss, ROLES } from '../data/roles';
import { useT } from '../i18n';

/** A small square in a role's colour and pattern (or any CSS background). */
export function RoleSwatch({ background, className = '' }: { background: string; className?: string }) {
  return <span aria-hidden className={`inline-block h-3 w-3 shrink-0 rounded-[3px] ${className}`} style={{ background }} />;
}

/** Role key for the model: colour, pattern and name together, never colour alone. */
export function Legend({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useT();
  return (
    <ul aria-label={t('Muscle roles')} className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ivory/90 ${className}`}>
      {ROLES.map((r) => (
        <li key={r.role} className="flex items-center gap-1.5">
          <RoleSwatch background={patternCss(r)} />
          {t(r.shortLabel)}
        </li>
      ))}
      {/* On a phone the see-through grey speaks for itself; keeping the key to one row leaves the head in view. */}
      {!compact && (
        <li className="flex items-center gap-1.5 text-fog">
          <RoleSwatch background={NEUTRAL_COLOR} className="opacity-50" />
          {t('Not used')}
        </li>
      )}
    </ul>
  );
}
