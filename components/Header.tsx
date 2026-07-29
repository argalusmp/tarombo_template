'use client';

import React from 'react';
import { GitBranch, Sparkles } from 'lucide-react';

// ============================================================
// Header — Bilah branding aplikasi
// ============================================================

export default function Header() {
  return (
    <header
      style={{
        height: 64,
        background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        position: 'relative',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Glow gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #818cf8, #c084fc, #818cf8, transparent)',
          opacity: 0.7,
        }}
      />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(129, 140, 248, 0.4)',
            flexShrink: 0,
          }}
        >
          <GitBranch size={18} color="#fff" />
        </div>

        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              background: 'linear-gradient(90deg, #f1f5f9, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Tarombo Digital
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#64748b',
              letterSpacing: '0.02em',
              fontWeight: 500,
            }}
          >
            Generator Pohon Keluarga Batak Interaktif
          </div>
        </div>
      </div>

      {/* Kanan: badge fase */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            background: 'rgba(129, 140, 248, 0.1)',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            fontSize: 11,
            color: '#818cf8',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          <Sparkles size={11} />
          Fase 1 MVP
        </div>
      </div>
    </header>
  );
}
