'use client';

import React, { memo } from 'react';
import {
  Users,
  TrendingUp,
  Heart,
  SkullIcon,
  GitBranch,
  Crown,
  X,
  BarChart2,
} from 'lucide-react';
import type { ExtendedStats } from '@/types/tarombo';

// ============================================================
// StatisticsPanel — floating panel with extended tree stats
// ============================================================

interface StatisticsPanelProps {
  stats: ExtendedStats;
  onClose: () => void;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
  sublabel?: string;
}

const StatItem = memo(function StatItem({ icon, value, label, color, sublabel }: StatItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid #1e293b',
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 2, fontWeight: 500 }}>
          {label}
          {sublabel && (
            <span style={{ marginLeft: 4, color: '#334155' }}>· {sublabel}</span>
          )}
        </div>
      </div>
    </div>
  );
});

const StatisticsPanel = memo(function StatisticsPanel({ stats, onClose }: StatisticsPanelProps) {
  const alivePercent = stats.total > 0 ? Math.round((stats.alive / stats.total) * 100) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        left: 16,
        width: 280,
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
          <BarChart2 size={15} color="#818cf8" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
            Statistik Tarombo
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#475569',
            display: 'flex',
            padding: 4,
            borderRadius: 6,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#475569')}
        >
          <X size={14} />
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <StatItem icon={<Users size={15} />} value={stats.total} label="Total Anggota" color="#818cf8" />
        <StatItem icon={<TrendingUp size={15} />} value={stats.generations} label="Generasi" color="#22d3ee" />

        {/* Male / Female side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <StatItem icon={<span style={{ fontSize: 13, fontWeight: 800 }}>L</span>} value={stats.males} label="Laki-laki" color="#60a5fa" />
          <StatItem icon={<span style={{ fontSize: 13, fontWeight: 800 }}>P</span>} value={stats.females} label="Perempuan" color="#f472b6" />
        </div>

        {/* Alive / Deceased */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <StatItem icon={<Heart size={14} />} value={stats.alive} label="Masih Hidup" color="#34d399" />
          <StatItem icon={<SkullIcon size={14} />} value={stats.deceased} label="Almarhum" color="#64748b" />
        </div>

        {/* Alive progress bar */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Masih Hidup
            </span>
            <span style={{ fontSize: 10, color: '#34d399', fontWeight: 700 }}>{alivePercent}%</span>
          </div>
          <div style={{ height: 4, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${alivePercent}%`,
                background: 'linear-gradient(90deg, #34d399, #10b981)',
                borderRadius: 4,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        <StatItem icon={<GitBranch size={14} />} value={stats.branches} label="Cabang Keluarga" color="#f59e0b" />

        {stats.rootPersonName && (
          <StatItem
            icon={<Crown size={14} />}
            value={stats.rootPersonName}
            label="Leluhur Akar"
            color="#a78bfa"
          />
        )}
      </div>
    </div>
  );
});

StatisticsPanel.displayName = 'StatisticsPanel';

export default StatisticsPanel;
