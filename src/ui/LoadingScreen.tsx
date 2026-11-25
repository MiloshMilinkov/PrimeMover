import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';

/** Progress overlay while the body model downloads and decodes. */
export function LoadingScreen() {
  const { active, progress } = useProgress();
  const pct = Math.round(progress);
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="absolute inset-0 z-40 grid place-items-center bg-vitrine"
          role="progressbar"
          aria-label="Loading the body model"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="w-[min(320px,80vw)]">
            <p className="latin text-[28px] leading-tight text-ivory">Corpus humanum</p>
            <p className="mt-1 text-[14px] text-fog">Loading the body model, {pct}%</p>
            <div className="mt-4 h-px w-full bg-hairline">
              <div className="h-px bg-ivory transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
