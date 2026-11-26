import { useCallback, useEffect, useRef, useState } from 'react';
import { useViewer } from '../state/viewer';

export const RAIL_WIDTH = 300;
export const PANEL_WIDTH = 380;
/** Lowest mobile-sheet height while browsing: tabs, search and the result count stay visible. */
export const SHEET_PEEK_BROWSE = 156;
/** Lowest mobile-sheet height on an exercise or muscle: the back button and the name. */
export const SHEET_PEEK_DETAIL = 84;

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function useWindowSize() {
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

type Edge = 'top' | 'left' | 'right' | 'bottom';

/** Gap kept between a panel and the framed body. */
const GAP = 8;

/**
 * Measures the panels on each screen edge and stores the free area for the camera.
 * Returns `track(edge)`, a ref callback for the element covering that edge.
 * `minBottom` reserves space for an element that moves by transform (the mobile sheet).
 */
export function useInsetTracking(minBottom = 0) {
  const nodes = useRef(new Map<Edge, HTMLElement>());
  const refs = useRef(new Map<Edge, (el: HTMLElement | null) => void>());
  const observer = useRef<ResizeObserver | null>(null);
  const setInsets = useViewer((s) => s.setInsets);

  const measure = useCallback(() => {
    const box = (edge: Edge) => nodes.current.get(edge)?.getBoundingClientRect();
    const [top, left, right, bottom] = (['top', 'left', 'right', 'bottom'] as const).map(box);
    setInsets({
      top: top ? top.bottom + GAP : 0,
      left: left ? left.right + GAP : 0,
      right: right ? window.innerWidth - right.left + GAP : 0,
      bottom: Math.max(minBottom, bottom ? window.innerHeight - bottom.top + GAP : 0),
    });
  }, [setInsets, minBottom]);

  // Ref callbacks are cached per edge, so they reach the latest measure through a ref.
  const measureRef = useRef(measure);
  useEffect(() => {
    measureRef.current = measure;
    measure();
  }, [measure]);

  useEffect(() => {
    const run = () => measureRef.current();
    observer.current = new ResizeObserver(run);
    for (const el of nodes.current.values()) observer.current.observe(el);
    window.addEventListener('resize', run);
    return () => {
      observer.current?.disconnect();
      window.removeEventListener('resize', run);
    };
  }, []);

  return useCallback((edge: Edge) => {
    let ref = refs.current.get(edge);
    if (!ref) {
      ref = (el) => {
        const prev = nodes.current.get(edge);
        if (prev) observer.current?.unobserve(prev);
        if (el) {
          nodes.current.set(edge, el);
          observer.current?.observe(el);
        } else nodes.current.delete(edge);
        measureRef.current();
      };
      refs.current.set(edge, ref);
    }
    return ref;
  }, []);
}
