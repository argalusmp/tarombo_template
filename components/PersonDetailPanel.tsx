'use client';

import React, { useEffect, useRef } from 'react';
import { X, GitBranch, Users, Star, Calendar, Heart, FileText, Loader2 } from 'lucide-react';
import type { TaromboPerson } from '@/types/tarombo';

// ============================================================
// PersonDetailPanel — right sidebar that slides in on node click
// ============================================================

interface PersonDetailPanelProps {
  person: TaromboPerson | null;
  fatherName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusLineage: (person: TaromboPerson) => void;
  onExploreRelations: (person: TaromboPerson) => void;
}

export default function PersonDetailPanel({
  person,
  fatherName,
  isOpen,
  onClose,
  onFocusLineage,
  onExploreRelations,
}: PersonDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const isMale = person?.gender === 'L';
  const isFemale = person?.gender === 'P';
  const isAlive = person ? !person.deathYear : true;

  const genderColor = isMale ? '#60a5fa' : isFemale ? '#f472b6' : '#94a3b8';
  const genderLabel = isMale ? 'Laki-laki' : isFemale ? 'Perempuan' : 'Tidak diketahui';

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        background: 'linear-gradient(180deg, #0f1a2e 0%, #0a0f1e 100%)',
        borderLeft: '1px solid #1e293b',
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.5)',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          background: 'rgba(99, 102, 241, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: isMale
                ? 'rgba(59, 130, 246, 0.2)'
                : isFemale
                ? 'rgba(236, 72, 153, 0.2)'
                : 'rgba(71, 85, 105, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${genderColor}44`,
            }}
          >
            <Users size={16} color={genderColor} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Detail Anggota
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 1 }}>
              {person?.id ? `ID: ${person.id}` : '—'}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #334155',
            borderRadius: 8,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#334155';
            (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30, 41, 59, 0.8)';
            (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      {person ? (
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#f1f5f9',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {person.name}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 8,
              }}
            >
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: isMale
                    ? 'rgba(59, 130, 246, 0.15)'
                    : isFemale
                    ? 'rgba(236, 72, 153, 0.15)'
                    : 'rgba(71, 85, 105, 0.15)',
                  color: genderColor,
                  border: `1px solid ${genderColor}33`,
                }}
              >
                {genderLabel}
              </span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: isAlive ? 'rgba(52, 211, 153, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                  color: isAlive ? '#34d399' : '#64748b',
                  border: `1px solid ${isAlive ? '#34d39933' : '#64748b33'}`,
                }}
              >
                {isAlive ? '● Masih hidup' : '● Almarhum'}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InfoRow icon={<GitBranch size={13} />} label="Marga" value={person.marga} color="#a78bfa" />
            <InfoRow icon={<Star size={13} />} label="Generasi" value={person.generationComputed ? `Generasi ${person.generationComputed}` : null} color="#f59e0b" />
            <InfoRow icon={<Users size={13} />} label="Ayah" value={fatherName} color="#60a5fa" />
            <InfoRow icon={<Heart size={13} />} label="Pasangan" value={person.spouse} color="#f472b6" />
            <InfoRow icon={<Calendar size={13} />} label="Lahir" value={person.birthYear} color="#34d399" />
            <InfoRow icon={<Calendar size={13} />} label="Wafat" value={person.deathYear} color="#94a3b8" />
            {person.notes && (
              <div
                style={{
                  marginTop: 12,
                  padding: '12px 14px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: 10,
                  border: '1px solid #1e293b',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    color: '#64748b',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  <FileText size={12} />
                  Catatan
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                  {person.notes}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => onFocusLineage(person)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.35)';
              }}
            >
              <GitBranch size={14} />
              Fokus Tarombo
            </button>

            <button
              onClick={() => onExploreRelations(person)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                color: '#94a3b8',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#334155';
                (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30, 41, 59, 0.8)';
                (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
              }}
            >
              <Users size={14} />
              Jelajahi Relasi
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#334155',
          }}
        >
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}
    </div>
  );
}

// ── Sub-component: info row ──────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  color: string;
}

function InfoRow({ icon, label, value, color }: InfoRowProps) {
  if (!value && value !== 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 12px',
        borderRadius: 8,
        background: 'rgba(15, 23, 42, 0.5)',
        marginBottom: 4,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: `${color}18`,
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
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, marginTop: 1 }}>
          {String(value)}
        </div>
      </div>
    </div>
  );
}
