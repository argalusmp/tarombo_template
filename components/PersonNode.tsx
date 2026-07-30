'use client';

import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import type { PersonNodeData } from '@/types/tarombo';

// ============================================================
// PersonNode — Custom React Flow node (Phase 2 enhanced)
// ============================================================

const PersonNode = memo(function PersonNode({ data }: NodeProps<Node<PersonNodeData>>) {
  const {
    person,
    isHighlighted,
    isSearchResult,
    isFaded,
    isSelected,
    isAncestor,
    isDescendant,
    isFocused,
    hasChildren,
    isCollapsed,
    onCollapse,
    onNodeClick,
  } = data;

  const isMale = person.gender === 'L';
  const isFemale = person.gender === 'P';
  const isAlive = !person.deathYear;

  // ── Priority-based visual state ─────────────────────────
  const borderColor = isSelected
    ? '#60a5fa'         // blue — selected
    : isSearchResult
    ? '#f59e0b'         // amber — search
    : isFocused
    ? '#a78bfa'         // violet — focused lineage
    : isAncestor
    ? '#f87171'         // red — ancestor
    : isDescendant
    ? '#4ade80'         // green — descendant
    : isHighlighted
    ? '#818cf8'         // indigo — generic highlight
    : isMale
    ? '#3b82f6'
    : isFemale
    ? '#ec4899'
    : '#475569';

  const bgGradient = isSelected
    ? 'linear-gradient(135deg, #1e3a5f 0%, #1e2a4a 100%)'
    : isAncestor
    ? 'linear-gradient(135deg, #3f1d1d 0%, #1e293b 100%)'
    : isDescendant
    ? 'linear-gradient(135deg, #1a3a2a 0%, #1e293b 100%)'
    : isFocused
    ? 'linear-gradient(135deg, #2d1b5e 0%, #1e293b 100%)'
    : isMale
    ? 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)'
    : isFemale
    ? 'linear-gradient(135deg, #4a1040 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';

  const glowColor = isSelected
    ? 'rgba(96, 165, 250, 0.5)'
    : isSearchResult
    ? 'rgba(245, 158, 11, 0.4)'
    : isFocused
    ? 'rgba(167, 139, 250, 0.45)'
    : isAncestor
    ? 'rgba(248, 113, 113, 0.4)'
    : isDescendant
    ? 'rgba(74, 222, 128, 0.4)'
    : isHighlighted
    ? 'rgba(129, 140, 248, 0.4)'
    : isMale
    ? 'rgba(59, 130, 246, 0.15)'
    : isFemale
    ? 'rgba(236, 72, 153, 0.15)'
    : 'rgba(71, 85, 105, 0.1)';

  const handleCollapseClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCollapse?.(person.id);
    },
    [onCollapse, person.id]
  );

  const handleNodeClick = useCallback(() => {
    onNodeClick?.(person);
  }, [onNodeClick, person]);

  return (
    <div
      onClick={handleNodeClick}
      style={{
        width: 200,
        minHeight: 88,
        background: bgGradient,
        border: `2px solid ${borderColor}`,
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: `0 0 0 1px ${borderColor}22, 0 4px 24px ${glowColor}, 0 2px 8px rgba(0,0,0,0.4)`,
        transition: 'all 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
        opacity: isFaded ? 0.18 : 1,
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
          opacity: 0.8,
        }}
      />

      {/* Alive / Deceased indicator */}
      {!isAlive && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#64748b',
            boxShadow: '0 0 4px #64748b',
          }}
          title="Almarhum"
        />
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: borderColor,
          width: 10,
          height: 10,
          border: '2px solid #0f172a',
          top: -6,
        }}
      />

      {/* Name + Gender badge row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#f1f5f9',
              lineHeight: 1.3,
              wordBreak: 'break-word',
            }}
          >
            {person.name}
          </div>
        </div>

        <div
          style={{
            marginLeft: 8,
            padding: '2px 7px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: isMale
              ? 'rgba(59, 130, 246, 0.25)'
              : isFemale
              ? 'rgba(236, 72, 153, 0.25)'
              : 'rgba(71, 85, 105, 0.25)',
            color: isMale ? '#93c5fd' : isFemale ? '#f9a8d4' : '#94a3b8',
            border: `1px solid ${borderColor}44`,
            flexShrink: 0,
          }}
        >
          {isMale ? 'L' : isFemale ? 'P' : '?'}
        </div>
      </div>

      {/* Marga */}
      {person.marga && (
        <div
          style={{
            fontSize: 11,
            color: '#94a3b8',
            marginBottom: 2,
            fontStyle: 'italic',
          }}
        >
          Marga: {person.marga}
        </div>
      )}

      {/* Birth/Death years row */}
      {(person.birthYear || person.deathYear) && (
        <div
          style={{
            fontSize: 10,
            color: '#64748b',
            marginTop: 2,
          }}
        >
          {person.birthYear && `b. ${person.birthYear}`}
          {person.birthYear && person.deathYear && ' — '}
          {person.deathYear && `†${person.deathYear}`}
        </div>
      )}

      {/* Spouse */}
      {person.spouse && (
        <div
          style={{
            fontSize: 10.5,
            color: '#64748b',
            marginTop: 4,
            paddingTop: 4,
            borderTop: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ opacity: 0.6 }}>♥</span>
          <span style={{ color: '#94a3b8' }}>{person.spouse}</span>
        </div>
      )}

      {/* Generation badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 10,
          fontSize: 9,
          color: '#475569',
          fontWeight: 600,
        }}
      >
        Gen {person.generationComputed}
      </div>

      {/* Collapse / Expand button */}
      {hasChildren && (
        <button
          onClick={handleCollapseClick}
          title={isCollapsed ? 'Tampilkan anak' : 'Sembunyikan anak'}
          style={{
            position: 'absolute',
            bottom: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: isCollapsed ? '#6366f1' : '#334155',
            border: `2px solid ${isCollapsed ? '#818cf8' : '#475569'}`,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            lineHeight: 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: borderColor,
          width: 10,
          height: 10,
          border: '2px solid #0f172a',
          bottom: -6,
        }}
      />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';

export default PersonNode;
