import type { Node, Edge } from '@xyflow/react';

// ============================================================
// TAROMBO DIGITAL — Type Definitions
// Source of truth: Tarombo_Template.xlsx → Sheet: "Tarombo"
// ============================================================

/**
 * Raw row shape from the Excel "Tarombo" sheet (column headers as-is).
 */
export interface TaromboRawRow {
  ID: number | string;
  'Father ID'?: number | string | null;
  Nama: string;
  Gender: string;
  Pasangan?: string | null;
  Generasi?: number | string | null;
  Marga?: string | null;
  Lahir?: string | number | null;
  Wafat?: string | number | null;
  Catatan?: string | null;
}

/**
 * Fully-parsed and validated person record.
 */
export interface TaromboPerson {
  id: string;
  fatherId: string | null;
  name: string;
  gender: 'L' | 'P' | 'unknown';
  spouse: string | null;
  generation: number | null; // from Excel; auto-calculated if null
  generationComputed: number; // always calculated from tree depth
  marga: string | null;
  birthYear: string | null;
  deathYear: string | null;
  notes: string | null;
  isRoot: boolean;
}

/**
 * A validation error encountered during parsing/validation.
 */
export interface ValidationError {
  type:
    | 'DUPLICATE_ID'
    | 'EMPTY_NAME'
    | 'INVALID_FATHER_ID'
    | 'CIRCULAR_RELATIONSHIP'
    | 'MISSING_ROOT'
    | 'INVALID_DATA_TYPE'
    | 'MULTIPLE_ROOTS';
  severity: 'error' | 'warning';
  row?: number;
  field?: string;
  message: string;
  affectedIds?: string[];
}

/**
 * The full parsed result of an Excel file.
 */
export interface FamilyTreeData {
  persons: TaromboPerson[];
  errors: ValidationError[];
  isValid: boolean;
  stats: {
    total: number;
    males: number;
    females: number;
    generations: number;
    roots: number;
  };
}

// ============================================================
// React Flow Node/Edge Types
// ============================================================

export interface PersonNodeData extends Record<string, unknown> {
  person: TaromboPerson;
  isHighlighted: boolean;
  isSearchResult: boolean;
}

export interface TreeLayoutResult {
  nodes: Node<PersonNodeData>[];
  edges: Edge[];
}
