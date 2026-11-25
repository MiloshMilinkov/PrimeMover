import { NEUTRAL_COLOR, patternCss, ROLES } from '../data/roles';

/** A small square in a role's colour and pattern (or any CSS background). */
export function RoleSwatch({ background, className = '' }: { background: string; className?: string }) {
  return <span aria-hidden className={`inline-block h-3 w-3 shrink-0 rounded-[3px] ${className}`} style={{ background }} />;
}

/** Role key for the model: colour, pattern and name together, never colour alone. */
export function Legend({ className = '' }: { className?: string }) {
  return (
    <ul aria-label="Muscle roles" className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ivory/90 ${className}`}>
      {ROLES.map((r) => (
        <li key={r.role} className="flex items-center gap-1.5">
          <RoleSwatch background={patternCss(r)} />
          {r.shortLabel}
        </li>
      ))}
      <li className="flex items-center gap-1.5 text-fog">
        <RoleSwatch background={NEUTRAL_COLOR} className="opacity-50" />
        Not used
      </li>
    </ul>
  );
}
