import type { TaromboPerson, ValidationError, FamilyTreeData } from '@/types/tarombo';

// ============================================================
// Validator — pemeriksaan struktural pada daftar person
// ============================================================

export function validatePersons(persons: TaromboPerson[], parseErrors: ValidationError[]): FamilyTreeData {
  const errors: ValidationError[] = [...parseErrors];
  const idSet = new Set<string>();

  // ─── 1. ID Duplikat ────────────────────────────────────────
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
        message: `ID "${id}" muncul sebanyak ${count} kali. Setiap ID harus unik.`,
        affectedIds: [id],
      });
    }
  });

  // Deduplikasi berdasarkan ID (ambil yang pertama)
  const deduped: TaromboPerson[] = [];
  persons.forEach((p) => {
    if (!idSet.has(p.id)) {
      idSet.add(p.id);
      deduped.push(p);
    }
  });

  // ─── 2. ID Ayah Tidak Valid ────────────────────────────────
  deduped.forEach((p) => {
    if (p.fatherId !== null && !idSet.has(p.fatherId)) {
      errors.push({
        type: 'INVALID_FATHER_ID',
        severity: 'error',
        field: 'Father ID',
        message: `Orang "${p.name}" (ID: ${p.id}) merujuk ID Ayah "${p.fatherId}" yang tidak ada dalam data.`,
        affectedIds: [p.id],
      });
      // Jadikan akar agar pohon tetap bisa dirender
      p.fatherId = null;
    }
  });

  // ─── 3. Deteksi akar silsilah ──────────────────────────────
  const roots = deduped.filter((p) => p.fatherId === null);

  if (roots.length === 0) {
    errors.push({
      type: 'MISSING_ROOT',
      severity: 'error',
      message: 'Tidak ditemukan akar silsilah. Setidaknya satu orang harus tidak memiliki ID Ayah (dikosongkan).',
    });
  }

  if (roots.length > 1) {
    errors.push({
      type: 'MULTIPLE_ROOTS',
      severity: 'warning',
      message: `Ditemukan ${roots.length} akar silsilah: ${roots.map((r) => `"${r.name}" (${r.id})`).join(', ')}. Semua akar akan ditampilkan dalam pohon.`,
      affectedIds: roots.map((r) => r.id),
    });
  }

  roots.forEach((r) => (r.isRoot = true));

  // ─── 4. Deteksi hubungan melingkar (DFS) ──────────────────
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
    if (inStack.has(id)) return true;
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
      message: `Terdeteksi hubungan melingkar pada ID: ${[...circularIds].join(', ')}.`,
      affectedIds: [...circularIds],
    });
  }

  // ─── 5. BFS: hitung generasiComputed ──────────────────────
  const personMap = new Map<string, TaromboPerson>();
  deduped.forEach((p) => personMap.set(p.id, p));

  roots.forEach((r) => (r.generationComputed = 1));

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

  // Fallback untuk node yang terputus
  deduped.forEach((p) => {
    if (p.generationComputed === 0) p.generationComputed = 1;
  });

  // ─── Statistik ─────────────────────────────────────────────
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
