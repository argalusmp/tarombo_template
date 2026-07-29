'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import type { PersonNodeData } from '@/types/tarombo';

// ============================================================
// PersonNode — Custom React Flow node for a family member
// ============================================================

const PersonNode = memo(function PersonNode({ data }: NodeProps<Node<PersonNodeData>>) {
  const { person, isHighlighted, isSearchResult } = data;

  const isMale = person.gender === 'L';
  const isFemale = person.gender === 'P';

  const borderColor = isSearchResult
    ? '#f59e0b'
    : isHighlighted
    ? '#818cf8'
    : isMale
    ? '#3b82f6'
    : isFemale
    ? '#ec4899'
    : '#475569';

  const bgGradient = isMale
    ? 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)'
    : isFemale
    ? 'linear-gradient(135deg, #4a1040 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';

  const glowColor = isSearchResult
    ? 'rgba(245, 158, 11, 0.4)'
    : isHighlighted
    ? 'rgba(129, 140, 248, 0.4)'
    : isMale
    ? 'rgba(59, 130, 246, 0.15)'
    : isFemale
    ? 'rgba(236, 72, 153, 0.15)'
    : 'rgba(71, 85, 105, 0.1)';

  return (
    <div
      style={{
        width: 200,
        minHeight: 88,
        background: bgGradient,
        border: `2px solid ${borderColor}`,
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: `0 0 0 1px ${borderColor}22, 0 4px 24px ${glowColor}, 0 2px 8px rgba(0,0,0,0.4)`,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer accent */}
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

      {/* Gender badge */}
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
