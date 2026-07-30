'use client';

import { create } from 'zustand';
import type { TaromboPerson, FilterState, ExtendedStats } from '@/types/tarombo';

// ============================================================
// Tarombo Store — Zustand global state for Phase 2
// ============================================================

export interface TaromboStore {
  // ── Selected person (Detail Panel) ──────────────────────
  selectedPerson: TaromboPerson | null;
  setSelectedPerson: (person: TaromboPerson | null) => void;

  // ── Fokus Tarombo ────────────────────────────────────────
  focusedLineage: string[]; // IDs from root → selected person
  setFocusedLineage: (ids: string[]) => void;
  resetFocus: () => void;

  // ── Relationship Explorer ────────────────────────────────
  relationMode: boolean;
  setRelationMode: (active: boolean) => void;
  ancestorIds: Set<string>;
  descendantIds: Set<string>;
  setRelationIds: (ancestors: Set<string>, descendants: Set<string>) => void;
  clearRelations: () => void;

  // ── Collapse / Expand ────────────────────────────────────
  collapsedNodes: Set<string>;
  toggleCollapse: (id: string) => void;
  expandAll: () => void;

  // ── Filters ─────────────────────────────────────────────
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // ── Statistics ───────────────────────────────────────────
  statistics: ExtendedStats | null;
  setStatistics: (stats: ExtendedStats) => void;

  // ── Search ───────────────────────────────────────────────
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;

  // ── UI Panel visibility ──────────────────────────────────
  showDetailPanel: boolean;
  setShowDetailPanel: (v: boolean) => void;
  showStatsPanel: boolean;
  setShowStatsPanel: (v: boolean) => void;
  showFilterPanel: boolean;
  setShowFilterPanel: (v: boolean) => void;
  showLegend: boolean;
  setShowLegend: (v: boolean) => void;
}

const defaultFilters: FilterState = {
  gender: 'all',
  status: 'all',
  generation: null,
  lineageOnly: false,
};

export const useTaromboStore = create<TaromboStore>((set) => ({
  // ── Selected person ──────────────────────────────────────
  selectedPerson: null,
  setSelectedPerson: (person) =>
    set({ selectedPerson: person, showDetailPanel: person !== null }),

  // ── Fokus Tarombo ────────────────────────────────────────
  focusedLineage: [],
  setFocusedLineage: (ids) => set({ focusedLineage: ids }),
  resetFocus: () =>
    set({
      focusedLineage: [],
      relationMode: false,
      ancestorIds: new Set(),
      descendantIds: new Set(),
    }),

  // ── Relationship Explorer ────────────────────────────────
  relationMode: false,
  setRelationMode: (active) => set({ relationMode: active }),
  ancestorIds: new Set(),
  descendantIds: new Set(),
  setRelationIds: (ancestors, descendants) =>
    set({ ancestorIds: ancestors, descendantIds: descendants, relationMode: true }),
  clearRelations: () =>
    set({ ancestorIds: new Set(), descendantIds: new Set(), relationMode: false }),

  // ── Collapse / Expand ────────────────────────────────────
  collapsedNodes: new Set(),
  toggleCollapse: (id) =>
    set((state) => {
      const next = new Set(state.collapsedNodes);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { collapsedNodes: next };
    }),
  expandAll: () => set({ collapsedNodes: new Set() }),

  // ── Filters ─────────────────────────────────────────────
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),

  // ── Statistics ───────────────────────────────────────────
  statistics: null,
  setStatistics: (stats) => set({ statistics: stats }),

  // ── Search ───────────────────────────────────────────────
  searchKeyword: '',
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  // ── UI panels ────────────────────────────────────────────
  showDetailPanel: false,
  setShowDetailPanel: (v) => set({ showDetailPanel: v }),
  showStatsPanel: false,
  setShowStatsPanel: (v) => set({ showStatsPanel: v }),
  showFilterPanel: false,
  setShowFilterPanel: (v) => set({ showFilterPanel: v }),
  showLegend: false,
  setShowLegend: (v) => set({ showLegend: v }),
}));
