'use client';

import React, { memo, useMemo } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import type { FilterState, TaromboPerson } from '@/types/tarombo';

// ============================================================
// FilterPanel — filter by gender, status, generation, lineage
// ============================================================

interface FilterPanelProps {
  filters: FilterState;
  persons: TaromboPerson[];
  hasLineage: boolean;
  onFilterChange: (partial: Partial<FilterState>) => void;
  onReset: () => void;
  onClose: () => void;
}

const FilterPanel = memo(function FilterPanel({
  filters,
  persons,
  hasLineage,
  onFilterChange,
  onReset,
  onClose,
}: FilterPanelProps) {
  // Get unique generations for dropdown
  const generations = useMemo(() => {
    const gens = new Set<number>();
    for (const p of persons) {
      if (p.generationComputed) gens.add(p.generationComputed);
    }
    return Array.from(gens).sort((a, b) => a - b);
  }, [persons]);

  const isFiltered =
    filters.gender !== 'all' ||
    filters.status !== 'all' ||
    filters.generation !== null ||
    filters.lineageOnly;

  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        left: 16,
        width: 260,
        background: 'linear-gradient(180deg, #0f1a2e 0%, #0a0f1e 100%)',
        border: '1px solid #1e293b',
        borderRadius: 16,
        zIndex: 30,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.25s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(99, 102, 241, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color="#818cf8" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Filter</span>
          {isFiltered && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                background: '#6366f1',
                color: '#fff',
                padding: '1px 6px',
                borderRadius: 10,
                letterSpacing: '0.05em',
              }}
            >
              AKTIF
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {isFiltered && (
            <button
              onClick={onReset}
              title="Reset semua filter"
              style={iconBtn}
              onMouseEnter={(e) => btnHover(e, true)}
              onMouseLeave={(e) => btnHover(e, false)}
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            onClick={onClose}
            style={iconBtn}
            onMouseEnter={(e) => btnHover(e, true)}
            onMouseLeave={(e) => btnHover(e, false)}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Gender */}
        <FilterGroup label="Gender">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'L', 'P'] as const).map((g) => (
              <ChipButton
                key={g}
                active={filters.gender === g}
                onClick={() => onFilterChange({ gender: g })}
                color={g === 'L' ? '#60a5fa' : g === 'P' ? '#f472b6' : '#818cf8'}
              >
                {g === 'all' ? 'Semua' : g === 'L' ? 'Laki-laki' : 'Perempuan'}
              </ChipButton>
            ))}
          </div>
        </FilterGroup>

        {/* Status */}
        <FilterGroup label="Status">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'alive', 'deceased'] as const).map((s) => (
              <ChipButton
                key={s}
                active={filters.status === s}
                onClick={() => onFilterChange({ status: s })}
                color={s === 'alive' ? '#34d399' : s === 'deceased' ? '#64748b' : '#818cf8'}
              >
                {s === 'all' ? 'Semua' : s === 'alive' ? 'Hidup' : 'Almarhum'}
              </ChipButton>
            ))}
          </div>
        </FilterGroup>

        {/* Generation */}
        <FilterGroup label="Generasi">
          <select
            value={filters.generation ?? ''}
            onChange={(e) =>
              onFilterChange({
                generation: e.target.value === '' ? null : parseInt(e.target.value, 10),
              })
            }
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: filters.generation ? '#f1f5f9' : '#64748b',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
            }}
          >
            <option value="">Semua Generasi</option>
            {generations.map((g) => (
              <option key={g} value={g}>
                Generasi {g}
              </option>
            ))}
          </select>
        </FilterGroup>

        {/* Lineage Only */}
        {hasLineage && (
          <FilterGroup label="Focus">
            <button
              onClick={() => onFilterChange({ lineageOnly: !filters.lineageOnly })}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: 8,
                border: `1px solid ${filters.lineageOnly ? '#6366f1' : '#334155'}`,
                background: filters.lineageOnly
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(30, 41, 59, 0.6)',
                color: filters.lineageOnly ? '#a78bfa' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>
                {filters.lineageOnly ? '✓' : '○'}
              </span>
              Hanya Jalur Fokus
            </button>
          </FilterGroup>
        )}
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;

// ── Sub-components ───────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '6px 4px',
        borderRadius: 7,
        border: `1px solid ${active ? color : '#334155'}`,
        background: active ? `${color}18` : 'rgba(30, 41, 59, 0.6)',
        color: active ? color : '#64748b',
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#475569',
  display: 'flex',
  padding: 4,
  borderRadius: 6,
  transition: 'color 0.15s',
};

function btnHover(e: React.MouseEvent, enter: boolean) {
  (e.currentTarget as HTMLButtonElement).style.color = enter ? '#f1f5f9' : '#475569';
}
