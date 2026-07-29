'use client';

import React from 'react';
import { Upload, FileSpreadsheet, GitBranch } from 'lucide-react';

// ============================================================
// EmptyState — Ditampilkan saat belum ada file yang diunggah
// ============================================================

interface EmptyStateProps {
  onUploadClick: () => void;
}

export default function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 40,
        userSelect: 'none',
      }}
    >
      {/* Ikon dekoratif */}
      <div
        style={{
          position: 'relative',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)',
          }}
        >
          <GitBranch size={32} color="#818cf8" />
        </div>
      </div>

      {/* Teks utama */}
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#f1f5f9',
            marginBottom: 10,
            letterSpacing: '-0.03em',
          }}
        >
          Unggah File Excel Tarombo Anda
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>
          Unggah file Excel menggunakan template Tarombo untuk menghasilkan pohon
          silsilah keluarga yang interaktif dan visual. Mendukung lebih dari 1.000
          anggota keluarga di lebih dari 30 generasi.
        </p>
      </div>

      {/* Tombol aksi */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          id="empty-state-upload"
          onClick={onUploadClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 8px 28px rgba(99, 102, 241, 0.5)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'none';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 4px 20px rgba(99, 102, 241, 0.4)';
          }}
        >
          <Upload size={16} />
          Unggah Excel
        </button>

        <a
          href="/Tarombo_Template.xlsx"
          download="Tarombo_Template.xlsx"
          id="empty-state-download"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            background: '#1e293b',
            color: '#94a3b8',
            fontWeight: 600,
            fontSize: 14,
            border: '1px solid #334155',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#334155';
            (e.currentTarget as HTMLAnchorElement).style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#1e293b';
            (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8';
          }}
        >
          <FileSpreadsheet size={16} />
          Unduh Template
        </a>
      </div>

      {/* Panduan kolom Excel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '14px 20px',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 10,
          fontSize: 12,
          color: '#64748b',
          maxWidth: 380,
          width: '100%',
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: '#94a3b8',
            marginBottom: 4,
            fontSize: 11,
            letterSpacing: '0.05em',
          }}
        >
          KOLOM WAJIB DI FILE EXCEL ANDA
        </div>
        {[
          ['ID', 'ID numerik unik untuk setiap orang'],
          ['Father ID', 'ID ayah (kosongkan untuk akar silsilah)'],
          ['Nama', 'Nama lengkap (wajib diisi)'],
          ['Gender', 'L = Laki-laki, P = Perempuan'],
          ['Pasangan', 'Nama pasangan (opsional)'],
          ['Marga', 'Marga / nama keluarga (opsional)'],
        ].map(([col, desc]) => (
          <div key={col} style={{ display: 'flex', gap: 8 }}>
            <span
              style={{
                fontWeight: 700,
                color: '#818cf8',
                width: 80,
                flexShrink: 0,
                fontFamily: 'monospace',
              }}
            >
              {col}
            </span>
            <span>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
