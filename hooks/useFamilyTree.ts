'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type {
  FamilyTreeData,
  PersonNodeData,
  TaromboPerson,
  FilterState,
  ExtendedStats,
} from '@/types/tarombo';
import { readFileAsArrayBuffer, parseExcelFile } from '@/lib/excelParser';
import { validatePersons } from '@/lib/validator';
import { buildTreeLayout } from '@/lib/treeLayout';
import {
  buildChildrenMap,
  buildPersonMap,
  getAncestors,
  getDescendants,
  getLineagePath,
  getHiddenByCollapse,
  countBranches,
} from '@/lib/lineageUtils';

// ============================================================
// useFamilyTree — Phase 2: orchestrates all tree state
// ============================================================

export interface FamilyTreeState {
  isLoading: boolean;
  fileName: string | null;
  treeData: FamilyTreeData | null;
  nodes: Node<PersonNodeData>[];
  edges: Edge[];
  error: string | null;
}

interface Phase2State {
  selectedPersonId: string | null;
  focusedLineage: string[];           // IDs: root → selected
  collapsedNodes: Set<string>;
  ancestorIds: Set<string>;
  descendantIds: Set<string>;
  relationMode: boolean;
  filters: FilterState;
}

const defaultFilters: FilterState = {
  gender: 'all',
  status: 'all',
  generation: null,
  lineageOnly: false,
};

const defaultPhase2: Phase2State = {
  selectedPersonId: null,
  focusedLineage: [],
  collapsedNodes: new Set(),
  ancestorIds: new Set(),
  descendantIds: new Set(),
  relationMode: false,
  filters: defaultFilters,
};

export function useFamilyTree() {
  const [state, setState] = useState<FamilyTreeState>({
    isLoading: false,
    fileName: null,
    treeData: null,
    nodes: [],
    edges: [],
    error: null,
  });

  const [p2, setP2] = useState<Phase2State>(defaultPhase2);

  // ── Derived maps (memoised) ──────────────────────────────
  const personMap = useMemo(
    () => buildPersonMap(state.treeData?.persons ?? []),
    [state.treeData]
  );

  const childrenMap = useMemo(
    () => buildChildrenMap(state.treeData?.persons ?? []),
    [state.treeData]
  );

  // ── Extended statistics ──────────────────────────────────
  const extendedStats = useMemo<ExtendedStats | null>(() => {
    if (!state.treeData) return null;
    const persons = state.treeData.persons;
    const roots = persons.filter((p) => p.isRoot);
    return {
      total: state.treeData.stats.total,
      males: state.treeData.stats.males,
      females: state.treeData.stats.females,
      generations: state.treeData.stats.generations,
      roots: state.treeData.stats.roots,
      alive: persons.filter((p) => !p.deathYear).length,
      deceased: persons.filter((p) => !!p.deathYear).length,
      branches: countBranches(persons, childrenMap),
      rootPersonName: roots[0]?.name ?? null,
    };
  }, [state.treeData, childrenMap]);

  // ── Build visible + annotated nodes ─────────────────────
  const { nodes, edges } = useMemo(() => {
    if (!state.treeData || state.nodes.length === 0) {
      return { nodes: state.nodes, edges: state.edges };
    }

    const persons = state.treeData.persons;
    const {
      selectedPersonId,
      focusedLineage,
      collapsedNodes,
      ancestorIds,
      descendantIds,
      relationMode,
      filters,
    } = p2;

    const hasFocus = focusedLineage.length > 0;
    const focusedSet = new Set(focusedLineage);
    const hiddenByCollapse = getHiddenByCollapse(collapsedNodes, childrenMap);

    // Apply filters to determine visible persons
    let visiblePersons = persons.filter((p) => {
      // Collapse hide
      if (hiddenByCollapse.has(p.id)) return false;
      // Gender filter
      if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
      // Status filter
      if (filters.status === 'alive' && p.deathYear) return false;
      if (filters.status === 'deceased' && !p.deathYear) return false;
      // Generation filter
      if (filters.generation !== null && p.generationComputed !== filters.generation) return false;
      // Lineage-only filter
      if (filters.lineageOnly && hasFocus && !focusedSet.has(p.id)) return false;
      return true;
    });

    const visibleIds = new Set(visiblePersons.map((p) => p.id));

    // Build annotated nodes
    const annotatedNodes = state.nodes
      .filter((n) => visibleIds.has(n.id))
      .map((n) => {
        const person = personMap.get(n.id);
        if (!person) return n;

        const isSelected = n.id === selectedPersonId;
        const isAncestor = relationMode && ancestorIds.has(n.id);
        const isDescendant = relationMode && descendantIds.has(n.id);
        const isFocused = hasFocus && focusedSet.has(n.id);
        const isFaded = hasFocus && !focusedSet.has(n.id) && !isSelected;
        const hasChildren = (childrenMap.get(n.id)?.length ?? 0) > 0;
        const isCollapsed = collapsedNodes.has(n.id);

        return {
          ...n,
          data: {
            ...n.data,
            isSelected,
            isAncestor,
            isDescendant,
            isFocused,
            isFaded,
            hasChildren,
            isCollapsed,
          },
        };
      });

    // Build visible edges (only between visible nodes)
    const annotatedEdges = state.edges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );

    return { nodes: annotatedNodes, edges: annotatedEdges };
  }, [state.nodes, state.edges, state.treeData, p2, personMap, childrenMap]);

  // ── File loading ─────────────────────────────────────────
  const loadFile = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      fileName: file.name,
    }));
    setP2(defaultPhase2);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const { persons, errors: parseErrors } = parseExcelFile(buffer);
      const treeData = validatePersons(persons, parseErrors);
      const { nodes, edges } = buildTreeLayout(treeData.persons);

      setState({
        isLoading: false,
        fileName: file.name,
        treeData,
        nodes,
        edges,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      fileName: null,
      treeData: null,
      nodes: [],
      edges: [],
      error: null,
    });
    setP2(defaultPhase2);
  }, []);

  // ── Highlight for search ─────────────────────────────────
  const highlightPersons = useCallback((ids: Set<string>) => {
    setState((prev) => {
      if (!prev.treeData) return prev;
      const updatedNodes = prev.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isHighlighted: ids.has(node.id),
          isSearchResult: ids.has(node.id),
        },
      }));
      return { ...prev, nodes: updatedNodes };
    });
  }, []);

  const clearHighlight = useCallback(() => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: false, isSearchResult: false },
      })),
    }));
  }, []);

  // ── Select person ────────────────────────────────────────
  const selectPerson = useCallback(
    (person: TaromboPerson | null) => {
      setP2((prev) => ({
        ...prev,
        selectedPersonId: person?.id ?? null,
        // Clear relation mode when selecting different person
        relationMode: false,
        ancestorIds: new Set(),
        descendantIds: new Set(),
      }));
    },
    []
  );

  // ── Fokus Tarombo ────────────────────────────────────────
  const focusLineage = useCallback(
    (personId: string) => {
      const path = getLineagePath(personId, personMap);
      setP2((prev) => ({
        ...prev,
        focusedLineage: path,
        selectedPersonId: personId,
        // Clear relation mode when switching to focus mode
        relationMode: false,
        ancestorIds: new Set(),
        descendantIds: new Set(),
      }));
    },
    [personMap]
  );

  const resetFocus = useCallback(() => {
    setP2((prev) => ({
      ...prev,
      focusedLineage: [],
      relationMode: false,
      ancestorIds: new Set(),
      descendantIds: new Set(),
    }));
  }, []);

  // ── Relationship Explorer ────────────────────────────────
  const exploreRelations = useCallback(
    (personId: string) => {
      const ancestors = getAncestors(personId, personMap);
      const descendants = getDescendants(personId, childrenMap);
      setP2((prev) => ({
        ...prev,
        ancestorIds: ancestors,
        descendantIds: descendants,
        relationMode: true,
        selectedPersonId: personId,
        // Clear Fokus Tarombo when exploring relations
        focusedLineage: [],
      }));
    },
    [personMap, childrenMap]
  );

  // ── Collapse / Expand ────────────────────────────────────
  const toggleCollapse = useCallback((id: string) => {
    setP2((prev) => {
      const next = new Set(prev.collapsedNodes);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, collapsedNodes: next };
    });
  }, []);

  const expandAll = useCallback(() => {
    setP2((prev) => ({ ...prev, collapsedNodes: new Set() }));
  }, []);

  // ── Filters ─────────────────────────────────────────────
  const setFilters = useCallback((partial: Partial<FilterState>) => {
    setP2((prev) => ({ ...prev, filters: { ...prev.filters, ...partial } }));
  }, []);

  const resetFilters = useCallback(() => {
    setP2((prev) => ({ ...prev, filters: defaultFilters }));
  }, []);

  // ── Attach callbacks to nodes (so PersonNode can call them) ─
  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onCollapse: toggleCollapse,
          onNodeClick: selectPerson,
        },
      })),
    [nodes, toggleCollapse, selectPerson]
  );

  return {
    // base state
    isLoading: state.isLoading,
    fileName: state.fileName,
    treeData: state.treeData,
    error: state.error,
    // nodes/edges with phase 2 annotations
    nodes: nodesWithCallbacks,
    edges,
    // phase 2 state
    selectedPerson: state.treeData
      ? personMap.get(p2.selectedPersonId ?? '') ?? null
      : null,
    focusedLineage: p2.focusedLineage,
    filters: p2.filters,
    extendedStats,
    personMap,
    childrenMap,
    hasFocus: p2.focusedLineage.length > 0 || p2.relationMode,
    // actions
    loadFile,
    reset,
    highlightPersons,
    clearHighlight,
    selectPerson,
    focusLineage,
    resetFocus,
    exploreRelations,
    toggleCollapse,
    expandAll,
    setFilters,
    resetFilters,
  };
}
