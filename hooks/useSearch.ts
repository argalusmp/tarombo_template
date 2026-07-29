'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import type { TaromboPerson } from '@/types/tarombo';

// ============================================================
// useSearch — fuzzy search over persons list
// ============================================================

export interface SearchResult {
  person: TaromboPerson;
  score: number;
}

export function useSearch(persons: TaromboPerson[]) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q || persons.length === 0) return [];

    return persons
      .map((person) => {
        const nameLower = person.name.toLowerCase();
        const margaLower = (person.marga ?? '').toLowerCase();
        const idStr = person.id;

        let score = 0;

        // Exact match on ID
        if (idStr === q) score = 100;
        // Name starts with query
        else if (nameLower.startsWith(q)) score = 80;
        // Name contains query
        else if (nameLower.includes(q)) score = 60;
        // Marga matches
        else if (margaLower.includes(q)) score = 40;
        // No match
        else score = 0;

        return { person, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // cap results
  }, [query, persons]);

  const clear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  return {
    query,
    setQuery,
    results,
    clear,
    inputRef,
    hasResults: results.length > 0,
  };
}
