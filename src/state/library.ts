import { create } from 'zustand';
import { NO_FILTERS, type ExerciseFilters } from '../lib/search';

export type LibraryTab = 'exercises' | 'muscles';

interface LibraryState {
  tab: LibraryTab;
  query: string;
  filters: ExerciseFilters;
  setTab: (tab: LibraryTab) => void;
  setQuery: (query: string) => void;
  setFilter: <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => void;
  clear: () => void;
}

/** Library tab, exercise search and filters; a store so they survive closing the panel. */
export const useLibrary = create<LibraryState>((set) => ({
  tab: 'exercises',
  query: '',
  filters: NO_FILTERS,
  setTab: (tab) => set({ tab }),
  setQuery: (query) => set({ query }),
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clear: () => set({ query: '', filters: NO_FILTERS }),
}));
