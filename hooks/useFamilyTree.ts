'use client';

import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { FamilyTreeData, PersonNodeData } from '@/types/tarombo';
import { readFileAsArrayBuffer, parseExcelFile } from '@/lib/excelParser';
import { validatePersons } from '@/lib/validator';
import { buildTreeLayout } from '@/lib/treeLayout';

// ============================================================
// useFamilyTree — orchestrates upload → parse → validate → layout
// ============================================================

export interface FamilyTreeState {
  isLoading: boolean;
  fileName: string | null;
  treeData: FamilyTreeData | null;
  nodes: Node<PersonNodeData>[];
  edges: Edge[];
  error: string | null;
}

export function useFamilyTree() {
  const [state, setState] = useState<FamilyTreeState>({
    isLoading: false,
    fileName: null,
    treeData: null,
    nodes: [],
    edges: [],
    error: null,
  });

  const loadFile = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      fileName: file.name,
    }));

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
  }, []);

  /**
   * Highlight specific person IDs on the canvas (for search)
   */
  const highlightPersons = useCallback(
    (ids: Set<string>) => {
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
    },
    []
  );

  const clearHighlight = useCallback(() => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: false, isSearchResult: false },
      })),
    }));
  }, []);

  return {
    ...state,
    loadFile,
    reset,
    highlightPersons,
    clearHighlight,
  };
}
