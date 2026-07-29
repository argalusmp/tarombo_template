import type { Node, Edge } from '@xyflow/react';
import type { TaromboPerson, PersonNodeData, TreeLayoutResult } from '@/types/tarombo';

// ============================================================
// Tree Layout Engine
// Uses a Reingold-Tilford inspired approach for clean hierarchy.
// Handles 1000+ nodes without overlap.
// ============================================================

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const H_GAP = 40;   // horizontal gap between siblings
const V_GAP = 120;  // vertical gap between generations

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  mod: number;
  children: LayoutNode[];
  parent: LayoutNode | null;
  thread: LayoutNode | null;
  ancestor: LayoutNode;
  change: number;
  shift: number;
  number: number; // position among siblings (1-indexed)
  prelimX: number;
}

function createLayoutNode(id: string, parent: LayoutNode | null): LayoutNode {
  const node: LayoutNode = {
    id,
    x: 0,
    y: 0,
    mod: 0,
    children: [],
    parent,
    thread: null,
    ancestor: null as unknown as LayoutNode,
    change: 0,
    shift: 0,
    number: 0,
    prelimX: 0,
  };
  node.ancestor = node;
  return node;
}

// ─── Buchheim/Walker Algorithm ─────────────────────────────

function firstWalk(v: LayoutNode): void {
  if (v.children.length === 0) {
    // leaf
    const leftSibling = getLeftSibling(v);
    v.prelimX = leftSibling
      ? leftSibling.prelimX + NODE_WIDTH + H_GAP
      : 0;
  } else {
    let defaultAncestor = v.children[0];
    v.children.forEach((w) => {
      firstWalk(w);
      defaultAncestor = apportion(w, defaultAncestor, v);
    });
    executeShifts(v);
    const midPoint =
      (v.children[0].prelimX + v.children[v.children.length - 1].prelimX) / 2;
    const leftSibling = getLeftSibling(v);
    if (leftSibling) {
      v.prelimX = leftSibling.prelimX + NODE_WIDTH + H_GAP;
      v.mod = v.prelimX - midPoint;
    } else {
      v.prelimX = midPoint;
    }
  }
}

function secondWalk(v: LayoutNode, m: number, depth: number): void {
  v.x = v.prelimX + m;
  v.y = depth * (NODE_HEIGHT + V_GAP);
  v.children.forEach((w) => secondWalk(w, m + v.mod, depth + 1));
}

function apportion(v: LayoutNode, defaultAncestor: LayoutNode, parent: LayoutNode): LayoutNode {
  const leftSibling = getLeftSibling(v);
  if (!leftSibling) return defaultAncestor;

  let vir = v;
  let vor = v;
  let vil = leftSibling;
  let vol = parent.children[0];

  let sir = vir.mod;
  let sor = vor.mod;
  let sil = vil.mod;
  let sol = vol.mod;

  while (nextRight(vil) && nextLeft(vir)) {
    vil = nextRight(vil)!;
    vir = nextLeft(vir)!;
    vol = nextLeft(vol)!;
    vor = nextRight(vor)!;

    vor.ancestor = v;

    const shift = vil.prelimX + sil - (vir.prelimX + sir) + NODE_WIDTH + H_GAP;
    if (shift > 0) {
      moveSubtree(ancestor(vil, v, defaultAncestor), v, shift, parent);
      sir += shift;
      sor += shift;
    }

    sil += vil.mod;
    sir += vir.mod;
    sol += vol.mod;
    sor += vor.mod;
  }

  if (nextRight(vil) && !nextRight(vor)) {
    vor.thread = nextRight(vil);
    vor.mod += sil - sor;
  }

  if (nextLeft(vir) && !nextLeft(vol)) {
    vol.thread = nextLeft(vir);
    vol.mod += sir - sol;
    defaultAncestor = v;
  }

  return defaultAncestor;
}

function moveSubtree(wl: LayoutNode, wr: LayoutNode, shift: number, parent: LayoutNode): void {
  const subtrees = wr.number - wl.number;
  if (subtrees !== 0) {
    wr.change -= shift / subtrees;
    wr.shift += shift;
    wl.change += shift / subtrees;
  }
  wr.prelimX += shift;
  wr.mod += shift;
}

function executeShifts(v: LayoutNode): void {
  let shift = 0;
  let change = 0;
  for (let i = v.children.length - 1; i >= 0; i--) {
    const w = v.children[i];
    w.prelimX += shift;
    w.mod += shift;
    change += w.change;
    shift += w.shift + change;
  }
}

function nextLeft(v: LayoutNode): LayoutNode | null {
  return v.children.length > 0 ? v.children[0] : v.thread;
}

function nextRight(v: LayoutNode): LayoutNode | null {
  return v.children.length > 0 ? v.children[v.children.length - 1] : v.thread;
}

function getLeftSibling(v: LayoutNode): LayoutNode | null {
  if (!v.parent) return null;
  const idx = v.parent.children.indexOf(v);
  return idx > 0 ? v.parent.children[idx - 1] : null;
}

function ancestor(vil: LayoutNode, v: LayoutNode, defaultAncestor: LayoutNode): LayoutNode {
  if (v.parent && v.parent.children.includes(vil.ancestor)) {
    return vil.ancestor;
  }
  return defaultAncestor;
}

// ─── Multi-root layout ──────────────────────────────────────

function layoutForest(roots: LayoutNode[]): void {
  // lay out each tree independently, then place them side-by-side
  let offsetX = 0;
  roots.forEach((root) => {
    firstWalk(root);
    secondWalk(root, 0, 0);

    // Find leftmost x of this subtree and shift to offset
    let minX = Infinity;
    const flatten = (n: LayoutNode) => {
      minX = Math.min(minX, n.x);
      n.children.forEach(flatten);
    };
    flatten(root);

    const shift = offsetX - minX;
    const shiftAll = (n: LayoutNode) => {
      n.x += shift;
      n.children.forEach(shiftAll);
    };
    shiftAll(root);

    // Measure width to place next tree
    let maxX = -Infinity;
    const measureMax = (n: LayoutNode) => {
      maxX = Math.max(maxX, n.x);
      n.children.forEach(measureMax);
    };
    measureMax(root);
    offsetX = maxX + NODE_WIDTH + H_GAP * 4;
  });
}

// ─── Main export ────────────────────────────────────────────

export function buildTreeLayout(
  persons: TaromboPerson[],
  highlightedIds?: Set<string>
): TreeLayoutResult {
  if (persons.length === 0) return { nodes: [], edges: [] };

  // Build parent→children map
  const childrenMap = new Map<string, string[]>();
  const personMap = new Map<string, TaromboPerson>();

  persons.forEach((p) => {
    personMap.set(p.id, p);
    if (p.fatherId) {
      const arr = childrenMap.get(p.fatherId) ?? [];
      arr.push(p.id);
      childrenMap.set(p.fatherId, arr);
    }
  });

  // Build LayoutNode tree
  const layoutNodeMap = new Map<string, LayoutNode>();

  function buildLayoutNode(id: string, parent: LayoutNode | null, depth = 0): LayoutNode {
    if (depth > 200) {
      // Safety guard against infinite recursion (shouldn't happen post-validation)
      return createLayoutNode(id, parent);
    }
    const ln = createLayoutNode(id, parent);
    layoutNodeMap.set(id, ln);

    const children = childrenMap.get(id) ?? [];
    children.forEach((childId, idx) => {
      const childLn = buildLayoutNode(childId, ln, depth + 1);
      childLn.number = idx + 1;
      ln.children.push(childLn);
    });

    return ln;
  }

  const roots = persons.filter((p) => p.isRoot);
  if (roots.length === 0) {
    // Fallback: treat generation 1 persons as roots
    persons.filter((p) => p.generationComputed === 1).forEach((p) => (p.isRoot = true));
  }

  const rootLayoutNodes = roots.map((r) => buildLayoutNode(r.id, null));

  // Handle persons not reachable from roots (disconnected nodes)
  persons.forEach((p) => {
    if (!layoutNodeMap.has(p.id)) {
      const ln = buildLayoutNode(p.id, null);
      rootLayoutNodes.push(ln);
    }
  });

  // Apply layout algorithm
  layoutForest(rootLayoutNodes);

  // Build React Flow nodes
  const rfNodes: Node<PersonNodeData>[] = persons.map((person) => {
    const ln = layoutNodeMap.get(person.id);
    return {
      id: person.id,
      type: 'personNode',
      position: { x: ln?.x ?? 0, y: ln?.y ?? 0 },
      data: {
        person,
        isHighlighted: highlightedIds?.has(person.id) ?? false,
        isSearchResult: highlightedIds?.has(person.id) ?? false,
      },
      draggable: true,
    };
  });

  // Build React Flow edges
  const rfEdges: Edge[] = [];
  persons.forEach((person) => {
    if (person.fatherId) {
      rfEdges.push({
        id: `e-${person.fatherId}-${person.id}`,
        source: person.fatherId,
        target: person.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#475569', strokeWidth: 2 },
      });
    }
  });

  return { nodes: rfNodes, edges: rfEdges };
}
