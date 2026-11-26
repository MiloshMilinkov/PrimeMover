import { useEffect, type RefObject } from 'react';

/**
 * Closes a popover on a pointer-down outside `root` or on Escape. Escape stops there,
 * so the app's own Escape shortcut does not also fire, and focus goes back to the
 * popover's toggle (the element with `aria-expanded`).
 */
export function useDismiss(open: boolean, setOpen: (open: boolean) => void, root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setOpen(false);
      root.current?.querySelector<HTMLElement>('[aria-expanded]')?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey, { capture: true });
    };
  }, [open, setOpen, root]);
}
