'use client';

import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { ValidationError } from '@/types/tarombo';

// ============================================================
// ValidationPanel — menampilkan kesalahan & peringatan validasi
// ============================================================

interface ValidationPanelProps {
  errors: ValidationError[];
  onDismiss: () => void;
}

const ERROR_ICONS: Record<ValidationError['type'], React.ReactNode> = {
  DUPLICATE_ID: <AlertCircle size={14} />,
  EMPTY_NAME: <AlertCircle size={14} />,
  INVALID_FATHER_ID: <AlertTriangle size={14} />,
  CIRCULAR_RELATIONSHIP: <AlertCircle size={14} />,
  MISSING_ROOT: <AlertCircle size={14} />,
  INVALID_DATA_TYPE: <AlertCircle size={14} />,
  MULTIPLE_ROOTS: <AlertTriangle size={14} />,
};

const ERROR_LABELS: Record<ValidationError['type'], string> = {
  DUPLICATE_ID: 'ID Duplikat',
  EMPTY_NAME: 'Nama Kosong',
  INVALID_FATHER_ID: 'ID Ayah Tidak Valid',
  CIRCULAR_RELATIONSHIP: 'Hubungan Melingkar',
  MISSING_ROOT: 'Tidak Ada Akar',
  INVALID_DATA_TYPE: 'Tipe Data Tidak Valid',
  MULTIPLE_ROOTS: 'Beberapa Akar Ditemukan',
};

export default function ValidationPanel({ errors, onDismiss }: ValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warnCount = errors.filter((e) => e.severity === 'warning').length;

  if (errors.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(620px, 90vw)',
        background: '#0f172a',
        border: '1px solid #ef444444',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px #ef444422',
        zIndex: 50,
      }}
    >
      {/* Header panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: '#1e293b',
          borderBottom: isExpanded ? '1px solid #334155' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
          }}
        >
          <AlertCircle size={15} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
            Masalah Validasi
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {errorCount > 0 && (
              <span style={{ color: '#ef4444' }}>
                {errorCount} kesalahan{errorCount > 1 ? '' : ''}
              </span>
            )}
            {errorCount > 0 && warnCount > 0 && ' · '}
            {warnCount > 0 && (
              <span style={{ color: '#f59e0b' }}>
                {warnCount} peringatan
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((v) => !v);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Daftar kesalahan */}
      {isExpanded && (
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          {errors.map((error, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 16px',
                borderBottom: index < errors.length - 1 ? '1px solid #1e293b' : 'none',
              }}
            >
              <div
                style={{
                  color: error.severity === 'error' ? '#ef4444' : '#f59e0b',
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                {ERROR_ICONS[error.type]}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: error.severity === 'error' ? '#ef4444' : '#f59e0b',
                    marginBottom: 2,
                  }}
                >
                  {ERROR_LABELS[error.type]}
                  {error.row && (
                    <span style={{ color: '#475569', marginLeft: 6 }}>
                      Baris {error.row}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  {error.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
