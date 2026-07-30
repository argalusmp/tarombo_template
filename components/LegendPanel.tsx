'use client';

import React, { memo } from 'react';
import { X, BookOpen } from 'lucide-react';

// ============================================================
// LegendPanel — explains node colors and states
// ============================================================

interface LegendPanelProps {
  onClose: () => void;
}

interface LegendItemProps {
  color: string;
  label: string;
  sublabel?: string;
  variant?: 'solid' | 'border' | 'dot';
}

const LegendItem = memo(function LegendItem({
  color,
  label,
  sublabel,
  variant = 'solid',
}: LegendItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
      {variant === 'dot' ? (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: `${color}20`,
            border: `2px solid ${color}`,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        </div>
      ) : variant === 'border' ? (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            background: 'transparent',
            border: `2px dashed ${color}`,
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            background: `${color}25`,
            border: `2px solid ${color}`,
            flexShrink: 0,
          }}
        />
      )}
      <div>
        <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{sublabel}</div>
        )}
      </div>
    </div>
  );
});

const LegendPanel = memo(function LegendPanel({ onClose }: LegendPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 70,
        right: 16,
        width: 240,
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
          padding: '12px 16px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(99, 102, 241, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={14} color="#818cf8" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Legenda</span>
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
          <X size={13} />
        </button>
      </div>

      {/* Legend sections */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <SectionLabel>Jenis Kelamin</SectionLabel>
        <LegendItem color="#3b82f6" label="Laki-laki" sublabel="Border biru" />
        <LegendItem color="#ec4899" label="Perempuan" sublabel="Border merah muda" />

        <Divider />

        <SectionLabel>Status</SectionLabel>
        <LegendItem color="#34d399" label="Masih Hidup" variant="dot" />
        <LegendItem color="#64748b" label="Almarhum" sublabel="Tanpa indikator hijau" variant="dot" />

        <Divider />

        <SectionLabel>Relasi</SectionLabel>
        <LegendItem color="#60a5fa" label="Dipilih" sublabel="Node yang diklik" />
        <LegendItem color="#f87171" label="Leluhur" sublabel="Ayah, kakek, …" />
        <LegendItem color="#4ade80" label="Keturunan" sublabel="Anak, cucu, …" />

        <Divider />

        <SectionLabel>Mode Focus</SectionLabel>
        <LegendItem color="#a78bfa" label="Jalur Fokus" sublabel="Root → Dipilih" />
        <LegendItem color="#334155" label="Redup" sublabel="Di luar jalur fokus" variant="border" />

        <Divider />

        <SectionLabel>Lainnya</SectionLabel>
        <LegendItem color="#f59e0b" label="Hasil Cari" sublabel="Cocok pencarian" />
        <LegendItem color="#818cf8" label="Sorotan" sublabel="Highlight umum" />
      </div>
    </div>
  );
});

LegendPanel.displayName = 'LegendPanel';

export default LegendPanel;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 700,
        color: '#334155',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 4,
        marginTop: 4,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#1e293b', margin: '8px 0' }} />;
}
