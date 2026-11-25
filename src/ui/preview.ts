import type { MuscleId } from '../data/schema';
import { useViewer } from '../state/viewer';

/** Props that highlight a muscle on the model while a list row is hovered or focused. */
export function usePreviewProps() {
  const setPreview = useViewer((s) => s.setPreview);
  return (id: MuscleId) => ({
    onMouseEnter: () => setPreview(id),
    onMouseLeave: () => setPreview(null),
    onFocus: () => setPreview(id),
    onBlur: () => setPreview(null),
  });
}
