import { useId, type KeyboardEvent } from 'react';
import { useT } from '../i18n';

interface Option<T extends string | number> {
  value: T;
  label: string;
}

/** Radio-group style segmented control with arrow-key navigation. Option labels go through t(), so pass English (msg()) labels. */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  className = '',
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const { t } = useT();
  const id = useId();
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = options.findIndex((o) => o.value === value);
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = options[(i + step + options.length) % options.length];
    onChange(next.value);
    (e.currentTarget.querySelector(`[data-value="${String(next.value)}"]`) as HTMLElement | null)?.focus();
  };
  return (
    <div role="radiogroup" aria-labelledby={id} onKeyDown={onKey} className={`flex items-center gap-1 ${className}`}>
      <span id={id} className="sr-only">
        {label}
      </span>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            data-value={String(o.value)}
            onClick={() => onChange(o.value)}
            className={`whitespace-nowrap rounded-control px-3 py-1.5 text-[13px] font-medium transition-colors ${
              active ? 'bg-ivory text-vitrine' : 'text-fog hover:bg-hairline hover:text-ivory'
            }`}
          >
            {t(o.label)}
          </button>
        );
      })}
    </div>
  );
}
