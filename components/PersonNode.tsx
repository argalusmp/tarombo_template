'use client';

import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import type { PersonNodeData } from '@/types/tarombo';

// ============================================================
// PersonNode — Custom React Flow node (Phase 2.1 — fixed dims)
//
// CRITICAL: Width and height are ALWAYS 220 × 150 px.
// No content (name length, spouse, marga, fields) may change
// the outer box dimensions. All text is overflow-hidden.
// ============================================================

// ── Fixed node dimensions ─────────────────────────────────
export const PERSON_NODE_WIDTH  = 220;
export const PERSON_NODE_HEIGHT = 120;

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

  const isMale   = person.gender === 'L';
  const isFemale = person.gender === 'P';
  const isAlive  = !person.deathYear;

  // ── Priority-based visual state ─────────────────────────
  const borderColor = isSelected
    ? '#60a5fa'
    : isSearchResult
    ? '#f59e0b'
    : isFocused
    ? '#a78bfa'
    : isAncestor
    ? '#f87171'
    : isDescendant
    ? '#4ade80'
    : isHighlighted
    ? '#818cf8'
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

  // ── Shared text truncation style ─────────────────────────
  const truncate: React.CSSProperties = {
    overflow:     'hidden',
    whiteSpace:   'nowrap',
    textOverflow: 'ellipsis',
  };

  return (
    <div
      onClick={handleNodeClick}
      style={{
        // ── Fixed outer box — NEVER changes size ──────────
        width:    PERSON_NODE_WIDTH,
        height:   PERSON_NODE_HEIGHT,
        overflow: 'hidden',
        // ─────────────────────────────────────────────────
        background:    bgGradient,
        border:        `2px solid ${borderColor}`,
        borderRadius:  12,
        boxShadow:     `0 0 0 1px ${borderColor}22, 0 4px 24px ${glowColor}, 0 2px 8px rgba(0,0,0,0.4)`,
        transition:    'all 0.25s ease',
        position:      'relative',
        opacity:       isFaded ? 0.18 : 1,
        cursor:        'pointer',
        transform:     isSelected ? 'scale(1.04)' : 'scale(1)',
        display:       'flex',
        flexDirection: 'column',
        padding:       '8px 12px 18px', // bottom pad reserves space for Gen badge
        boxSizing:     'border-box',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     2,
          background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
          opacity:    0.8,
        }}
      />

      {/* Alive / Deceased indicator */}
      {!isAlive && (
        <div
          style={{
            position:     'absolute',
            top:          6,
            left:         6,
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   '#64748b',
            boxShadow:    '0 0 4px #64748b',
          }}
          title="Almarhum"
        />
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: borderColor,
          width:      10,
          height:     10,
          border:     '2px solid #0f172a',
          top:        -6,
        }}
      />

      {/* ═══════════════════════════════════════════════════
          ZONE 1 — Name + Gender badge (always present)
          Height: ~36px (2 lines max, ellipsis on 1 line)
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          gap:            6,
          flexShrink:     0,
          marginBottom:   2,
        }}
      >
        {/* Name — single line, truncated */}
        <div
          style={{
            flex:       1,
            minWidth:   0,
            fontSize:   13,
            fontWeight: 700,
            color:      '#f1f5f9',
            lineHeight: 1.3,
            ...truncate,
          }}
          title={person.name}
        >
          {person.name}
        </div>

        {/* Gender badge */}
        <div
          style={{
            padding:       '2px 6px',
            borderRadius:  6,
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: '0.05em',
            background:    isMale
              ? 'rgba(59, 130, 246, 0.25)'
              : isFemale
              ? 'rgba(236, 72, 153, 0.25)'
              : 'rgba(71, 85, 105, 0.25)',
            color:         isMale ? '#93c5fd' : isFemale ? '#f9a8d4' : '#94a3b8',
            border:        `1px solid ${borderColor}44`,
            flexShrink:    0,
          }}
        >
          {isMale ? 'L' : isFemale ? 'P' : '?'}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          ZONE 2 — Marga (always rendered, empty if none)
          Height: ~15px — keeps spacing consistent
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          fontSize:     11,
          color:        '#94a3b8',
          fontStyle:    'italic',
          lineHeight:   1.4,
          flexShrink:   0,
          marginBottom: 2,
          minHeight:    15,
          ...truncate,
        }}
        title={person.marga ?? undefined}
      >
        {person.marga ? `Marga: ${person.marga}` : ''}
      </div>

      {/* ═══════════════════════════════════════════════════
          ZONE 3 — Birth/Death years (always rendered)
          Height: ~13px
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          fontSize:     10,
          color:        '#64748b',
          lineHeight:   1.4,
          flexShrink:   0,
          marginBottom: 4,
          minHeight:    13,
          ...truncate,
        }}
      >
        {person.birthYear && `b. ${person.birthYear}`}
        {person.birthYear && person.deathYear && ' — '}
        {person.deathYear && `†${person.deathYear}`}
      </div>

      {/* ═══════════════════════════════════════════════════
          ZONE 4 — Spouse (always rendered, empty if none)
          Fixed height with top border divider.
          Empty area is reserved so nodes without spouses
          have IDENTICAL height to nodes WITH spouses.
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          flexShrink:   0,
          borderTop:    '1px solid #334155',
          paddingTop:   4,
          minHeight:    20,
          display:      'flex',
          alignItems:   'center',
          gap:          4,
          overflow:     'hidden',
        }}
      >
        {person.spouse ? (
          <>
            <span style={{ opacity: 0.55, fontSize: 11, flexShrink: 0 }}>♥</span>
            <span
              style={{
                fontSize:   10.5,
                color:      '#94a3b8',
                flex:       1,
                minWidth:   0,
                ...truncate,
              }}
              title={person.spouse}
            >
              {person.spouse}
            </span>
          </>
        ) : null}
      </div>

      {/* ═══════════════════════════════════════════════════
          Generation badge — absolute bottom-right
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          position:   'absolute',
          bottom:     5,
          right:      10,
          fontSize:   9,
          color:      '#475569',
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
            position:       'absolute',
            bottom:         -10,
            left:           '50%',
            transform:      'translateX(-50%)',
            width:          20,
            height:         20,
            borderRadius:   '50%',
            background:     isCollapsed ? '#6366f1' : '#334155',
            border:         `2px solid ${isCollapsed ? '#818cf8' : '#475569'}`,
            color:          '#fff',
            fontSize:       11,
            fontWeight:     700,
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            zIndex:         10,
            lineHeight:     1,
            transition:     'all 0.2s ease',
            boxShadow:      '0 2px 8px rgba(0,0,0,0.4)',
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
          width:      10,
          height:     10,
          border:     '2px solid #0f172a',
          bottom:     -6,
        }}
      />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';

export default PersonNode;
