import type { TaromboPerson } from '@/types/tarombo';

// ============================================================
// lineageUtils — pure helpers for lineage/relationship traversal
// ============================================================

/**
 * Build a map: personId → children IDs
 */
export function buildChildrenMap(persons: TaromboPerson[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const p of persons) {
    if (p.fatherId) {
      const arr = map.get(p.fatherId) ?? [];
      arr.push(p.id);
      map.set(p.fatherId, arr);
    }
  }
  return map;
}

/**
 * Build a map: personId → TaromboPerson
 */
export function buildPersonMap(persons: TaromboPerson[]): Map<string, TaromboPerson> {
  const map = new Map<string, TaromboPerson>();
  for (const p of persons) map.set(p.id, p);
  return map;
}

/**
 * Get all ancestor IDs for a person (parent, grandparent, … up to root).
 * Returns a Set of ancestor IDs (NOT including the person themselves).
 */
export function getAncestors(
  personId: string,
  personMap: Map<string, TaromboPerson>
): Set<string> {
  const ancestors = new Set<string>();
  let current = personMap.get(personId);
  while (current?.fatherId) {
    ancestors.add(current.fatherId);
    current = personMap.get(current.fatherId);
  }
  return ancestors;
}

/**
 * Get all descendant IDs for a person (children, grandchildren, …).
 * Returns a Set of descendant IDs (NOT including the person themselves).
 */
export function getDescendants(
  personId: string,
  childrenMap: Map<string, string[]>
): Set<string> {
  const descendants = new Set<string>();
  const queue: string[] = [personId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = childrenMap.get(current) ?? [];
    for (const childId of children) {
      if (!descendants.has(childId)) {
        descendants.add(childId);
        queue.push(childId);
      }
    }
  }
  return descendants;
}

/**
 * Get the complete lineage path from root to the given person.
 * Returns an array of IDs starting with the root, ending with personId.
 */
export function getLineagePath(
  personId: string,
  personMap: Map<string, TaromboPerson>
): string[] {
  const path: string[] = [];
  let current = personMap.get(personId);
  while (current) {
    path.unshift(current.id);
    if (!current.fatherId) break;
    current = personMap.get(current.fatherId);
  }
  return path;
}

/**
 * Count direct children of a person.
 */
export function countChildren(
  personId: string,
  childrenMap: Map<string, string[]>
): number {
  return childrenMap.get(personId)?.length ?? 0;
}

/**
 * Get all IDs that are descendants of any collapsed node.
 * Used to hide nodes when a parent is collapsed.
 */
export function getHiddenByCollapse(
  collapsedNodes: Set<string>,
  childrenMap: Map<string, string[]>
): Set<string> {
  const hidden = new Set<string>();
  for (const collapsedId of collapsedNodes) {
    const desc = getDescendants(collapsedId, childrenMap);
    desc.forEach((id) => hidden.add(id));
  }
  return hidden;
}

/**
 * Count number of family branches (direct children of root nodes).
 */
export function countBranches(
  persons: TaromboPerson[],
  childrenMap: Map<string, string[]>
): number {
  const roots = persons.filter((p) => p.isRoot);
  let count = 0;
  for (const root of roots) {
    count += childrenMap.get(root.id)?.length ?? 0;
  }
  return count || roots.length;
}
