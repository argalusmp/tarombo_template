import type { TaromboPerson, ValidationError, FamilyTreeData } from '@/types/tarombo';

// ============================================================
// Validator — runs structural checks on parsed person list
// ============================================================

export function validatePersons(persons: TaromboPerson[], parseErrors: ValidationError[]): FamilyTreeData {
  const errors: ValidationError[] = [...parseErrors];
  const idSet = new Set<string>();

  // ─── 1. Duplicate ID ───────────────────────────────────────
  const idCount = new Map<string, number>();
  persons.forEach((p) => {
    idCount.set(p.id, (idCount.get(p.id) ?? 0) + 1);
  });
  idCount.forEach((count, id) => {
    if (count > 1) {
      errors.push({
        type: 'DUPLICATE_ID',
        severity: 'error',
        field: 'ID',
        message: `ID "${id}" is duplicated ${count} times. IDs must be unique.`,
        affectedIds: [id],
      });
    }
  });

  // Deduplicate persons by ID (keep first occurrence) for further checks
  const deduped: TaromboPerson[] = [];
  persons.forEach((p) => {
    if (!idSet.has(p.id)) {
      idSet.add(p.id);
      deduped.push(p);
    }
  });

  // ─── 2. Invalid Father ID ──────────────────────────────────
  deduped.forEach((p) => {
    if (p.fatherId !== null && !idSet.has(p.fatherId)) {
      errors.push({
        type: 'INVALID_FATHER_ID',
        severity: 'error',
        field: 'Father ID',
        message: `Person "${p.name}" (ID: ${p.id}) references Father ID "${p.fatherId}" which does not exist.`,
        affectedIds: [p.id],
      });
      // Treat as root so the tree can still render
      p.fatherId = null;
    }
  });

  // ─── 3. Root detection ─────────────────────────────────────
  const roots = deduped.filter((p) => p.fatherId === null);

  if (roots.length === 0) {
    errors.push({
      type: 'MISSING_ROOT',
      severity: 'error',
      message: 'No root person found. At least one person must have no Father ID.',
    });
  }

  if (roots.length > 1) {
    errors.push({
      type: 'MULTIPLE_ROOTS',
      severity: 'warning',
      message: `Multiple roots detected (${roots.length}): ${roots.map((r) => `"${r.name}" (${r.id})`).join(', ')}. The tree will be rendered with all roots.`,
      affectedIds: roots.map((r) => r.id),
    });
  }

  roots.forEach((r) => (r.isRoot = true));

  // ─── 4. Circular relationship detection (DFS) ─────────────
  const childrenMap = new Map<string, string[]>();
  deduped.forEach((p) => {
    if (p.fatherId) {
      const siblings = childrenMap.get(p.fatherId) ?? [];
      siblings.push(p.id);
      childrenMap.set(p.fatherId, siblings);
    }
  });

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const circularIds = new Set<string>();

  function dfs(id: string): boolean {
    if (inStack.has(id)) return true; // cycle
    if (visited.has(id)) return false;

    visited.add(id);
    inStack.add(id);

    const children = childrenMap.get(id) ?? [];
    for (const childId of children) {
      if (dfs(childId)) {
        circularIds.add(id);
        circularIds.add(childId);
      }
    }

    inStack.delete(id);
    return false;
  }

  deduped.forEach((p) => {
    if (!visited.has(p.id)) dfs(p.id);
  });

  if (circularIds.size > 0) {
    errors.push({
      type: 'CIRCULAR_RELATIONSHIP',
      severity: 'error',
      message: `Circular relationship detected involving IDs: ${[...circularIds].join(', ')}.`,
      affectedIds: [...circularIds],
    });
  }

  // ─── 5. BFS: compute generationComputed ───────────────────
  const personMap = new Map<string, TaromboPerson>();
  deduped.forEach((p) => personMap.set(p.id, p));

  // Initialize root generation
  roots.forEach((r) => (r.generationComputed = 1));

  // BFS from all roots
  const queue: string[] = roots.map((r) => r.id);
  const bfsVisited = new Set<string>(roots.map((r) => r.id));

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const current = personMap.get(currentId)!;
    const children = childrenMap.get(currentId) ?? [];

    for (const childId of children) {
      if (!bfsVisited.has(childId)) {
        bfsVisited.add(childId);
        const child = personMap.get(childId);
        if (child) {
          child.generationComputed = current.generationComputed + 1;
          queue.push(childId);
        }
      }
    }
  }

  // Assign generation 1 to any disconnected nodes (shouldn't happen normally)
  deduped.forEach((p) => {
    if (p.generationComputed === 0) p.generationComputed = 1;
  });

  // ─── Stats ─────────────────────────────────────────────────
  const maxGen = deduped.reduce((m, p) => Math.max(m, p.generationComputed), 0);
  const males = deduped.filter((p) => p.gender === 'L').length;
  const females = deduped.filter((p) => p.gender === 'P').length;

  const isValid = !errors.some((e) => e.severity === 'error');

  return {
    persons: deduped,
    errors,
    isValid,
    stats: {
      total: deduped.length,
      males,
      females,
      generations: maxGen,
      roots: roots.length,
    },
  };
}
