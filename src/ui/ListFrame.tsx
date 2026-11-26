import type { ReactNode } from 'react';

/**
 * A list under a header that stays in view. In a side panel the list scrolls by itself;
 * in the mobile sheet it flows in the sheet's own scroll and the header sticks to the
 * top, so there is only one scroll area.
 */
export function ListFrame({ header, label, inSheet, children }: { header: ReactNode; label: string; inSheet: boolean; children: ReactNode }) {
  if (inSheet)
    return (
      <div>
        <div className="sticky top-0 z-10 -mx-4 bg-vitrine/95 px-4 pb-3 backdrop-blur">{header}</div>
        <nav aria-label={label} className="-mx-2 pb-3">
          {children}
        </nav>
      </div>
    );
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pb-3">{header}</div>
      <nav aria-label={label} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
        {children}
      </nav>
    </div>
  );
}

/** What the library passes to each list: where it is shown and what goes above it. */
export interface ListProps {
  onPick?: () => void;
  /** Rendered in the mobile sheet: one scroll area, sticky header. */
  inSheet?: boolean;
  /** Shown at the top of the header (the Exercises/Muscles tabs). */
  top?: ReactNode;
  /** Shown above the items when nothing is searched (quick picks). */
  intro?: ReactNode;
  /** The search field got focus (the sheet opens fully so results stay above the keyboard). */
  onSearchFocus?: () => void;
}
