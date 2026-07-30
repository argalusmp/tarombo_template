'use client';

import React, { memo } from 'react';
import { ChevronRight, X } from 'lucide-react';
import type { TaromboPerson } from '@/types/tarombo';

// ============================================================
// FocusBreadcrumb — shows the lineage path Root > … > Selected
// ============================================================

interface FocusBreadcrumbProps {
  lineagePath: string[];         // IDs from root to selected
  personMap: Map<string, TaromboPerson>;
  onSelectPerson: (person: TaromboPerson) => void;
  onReset: () => void;
}

const FocusBreadcrumb = memo(function FocusBreadcrumb({
  lineagePath,
  personMap,
  onSelectPerson,
  onReset,
}: FocusBreadcrumbProps) {
  if (lineagePath.length === 0) return null;

  const persons = lineagePath
    .map((id) => personMap.get(id))
    .filter((p): p is TaromboPerson => !!p);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        background: 'rgba(10, 15, 30, 0.92)',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '8px 14px',
        zIndex: 20,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        maxWidth: '80vw',
        overflowX: 'auto',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#6366f1',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        Jalur
      </span>

      {/* Breadcrumb items */}
      {persons.map((person, index) => (
        <React.Fragment key={person.id}>
          <button
            onClick={() => onSelectPerson(person)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: index === persons.length - 1 ? 700 : 500,
              color: index === persons.length - 1 ? '#a78bfa' : '#94a3b8',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                index === persons.length - 1 ? '#a78bfa' : '#94a3b8';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            {person.name}
          </button>
          {index < persons.length - 1 && (
            <ChevronRight size={12} color="#334155" style={{ flexShrink: 0 }} />
          )}
        </React.Fragment>
      ))}

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: '#334155', margin: '0 10px', flexShrink: 0 }} />

      {/* Reset button */}
      <button
        onClick={onReset}
        title="Reset Focus"
        style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 6,
          padding: '3px 10px',
          fontSize: 11,
          fontWeight: 700,
          color: '#f87171',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.25)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.12)';
        }}
      >
        <X size={11} />
        Reset Focus
      </button>
    </div>
  );
});

FocusBreadcrumb.displayName = 'FocusBreadcrumb';

export default FocusBreadcrumb;
