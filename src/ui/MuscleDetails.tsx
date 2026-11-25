import { Link } from 'react-router';
import { JOINT_LABEL } from '../data/labels';
import { MUSCLE_BY_ID } from '../data/muscles';
import type { JointId, MuscleId, MuscleLayer } from '../data/schema';
import { capitalise, joinList } from '../lib/text';
import { useViewer } from '../state/viewer';
import { bodyHalfWidthPx } from '../three/camera';
import { useWindowSize } from './layout';

const LAYER_LABEL: Record<MuscleLayer, string> = {
  superficial: 'Outer layer',
  intermediate: 'Middle layer',
  deep: 'Deep layer',
};

const listJoints = (joints: JointId[]) =>
  joints.length ? capitalise(joinList(joints.map((j) => JOINT_LABEL[j]))) : 'No limb joint (breathing and bracing)';

/** `titleHidden` keeps the name for screen readers when a sheet header already shows it. */
export function MuscleDetails({ id, titleHidden = false }: { id: MuscleId; titleHidden?: boolean }) {
  const m = MUSCLE_BY_ID[id];
  const frame = useViewer((s) => s.frame);
  const rows: [string, string][] = [
    ['Origin', m.origin],
    ['Insertion', m.insertion],
    ['Crosses', listJoints(m.jointsCrossed)],
    ['Depth', LAYER_LABEL[m.layer]],
  ];

  return (
    <article aria-labelledby="muscle-title" className="flex flex-col gap-4">
      <header>
        {m.parent && <p className="text-[13px] text-fog">{m.parent}</p>}
        <h2
          id="muscle-title"
          className={titleHidden ? 'sr-only' : 'text-[22px] font-semibold leading-tight tracking-[-0.01em]'}
        >
          {m.name}
        </h2>
        <p className="latin mt-1 text-[18px] leading-snug text-ivory/80">{m.latinName}</p>
      </header>

      <p className="max-w-[60ch] text-[15px] leading-relaxed text-ivory/90">{m.function}</p>

      <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2.5 border-t border-hairline pt-4 text-[14px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-fog">{k}</dt>
            <dd className="leading-snug">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={() => frame([id])} className="btn-primary">
          Zoom to muscle
        </button>
        <Link to="/" className="btn-secondary">
          Close
        </Link>
      </div>
    </article>
  );
}

/** Large Latin caption beside the model, like the label on an atlas plate. Desktop only. */
export function PlateCaption() {
  const selected = useViewer((s) => s.selected);
  const insets = useViewer((s) => s.insets);
  const { width, height } = useWindowSize();

  if (!selected) return null;
  const left = insets.left + 16;
  const freeCentre = (insets.left + (width - insets.right)) / 2;
  const maxWidth = freeCentre - bodyHalfWidthPx(height) - 24 - left;
  if (maxWidth < 170) return null;
  return (
    <p
      aria-hidden
      className="latin pointer-events-none absolute z-10 text-[clamp(26px,2.6vw,42px)] leading-[1.08] text-ivory/75"
      style={{ left, top: insets.top + 8, maxWidth }}
    >
      {MUSCLE_BY_ID[selected].latinName}
    </p>
  );
}
