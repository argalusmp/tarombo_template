'use client';

import React from 'react';
import { Users, GitBranch, TrendingUp } from 'lucide-react';
import type { FamilyTreeData } from '@/types/tarombo';

// ============================================================
// StatsBar — menampilkan statistik pohon di bilah yang ringkas
// ============================================================

interface StatsBarProps {
  treeData: FamilyTreeData;
}

export default function StatsBar({ treeData }: StatsBarProps) {
  const { stats } = treeData;

  const items = [
    {
      icon: <Users size={13} color="#818cf8" />,
      value: stats.total,
      label: 'Anggota',
      color: '#818cf8',
    },
    {
      icon: <TrendingUp size={13} color="#22d3ee" />,
      value: stats.generations,
      label: 'Generasi',
      color: '#22d3ee',
    },
    {
      icon: (
        <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa' }}>L</span>
      ),
      value: stats.males,
      label: 'Laki-laki',
      color: '#60a5fa',
    },
    {
      icon: (
        <span style={{ fontSize: 11, fontWeight: 700, color: '#f472b6' }}>P</span>
      ),
      value: stats.females,
      label: 'Perempuan',
      color: '#f472b6',
    },
    {
      icon: <GitBranch size={13} color="#34d399" />,
      value: stats.roots,
      label: stats.roots === 1 ? 'Akar' : 'Akar',
      color: '#34d399',
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 10,
        overflow: 'hidden',
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
            }}
          >
            {item.icon}
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: item.color,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {item.value.toLocaleString('id-ID')}
            </span>
            <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
              {item.label}
            </span>
          </div>
          {index < items.length - 1 && (
            <div style={{ width: 1, height: 20, background: '#1e293b' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
