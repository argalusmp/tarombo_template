'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import type { Node } from '@xyflow/react';
import {
  PAPER_SIZES,
  CUSTOM_PAPER_MIN_MM,
  CUSTOM_PAPER_MAX_MM,
  estimatePageCount,
  getEffectivePaperMm,
  type PaperSizeKey,
  type PdfOrientation,
  type PdfScaleMode,
  type PdfExportOptions,
} from '@/utils/exportUtils';

// ============================================================
// PdfExportModal — Professional PDF export dialog (Phase 2.1)
// ============================================================

interface PdfExportModalProps {
  isOpen:           boolean;
  isExporting:      boolean;
  nodes:            Node[];
  totalMembers:     number;
  totalGenerations: number;
  onClose:          () => void;
  onExport:         (opts: PdfExportOptions) => void;
}

// ── Default settings ──────────────────────────────────────────
const DEFAULT_PAPER: PaperSizeKey    = 'A3';
const DEFAULT_ORIENT: PdfOrientation = 'landscape';
const DEFAULT_SCALE: PdfScaleMode    = 'fitWidth';

export default function PdfExportModal({
  isOpen,
  isExporting,
  nodes,
  totalMembers,
  totalGenerations,
  onClose,
  onExport,
}: PdfExportModalProps) {
  // ── Form state ────────────────────────────────────────────
  const [paperKey, setPaperKey]         = useState<PaperSizeKey>(DEFAULT_PAPER);
  const [orientation, setOrientation]   = useState<PdfOrientation>(DEFAULT_ORIENT);
  const [scaleMode, setScaleMode]       = useState<PdfScaleMode>(DEFAULT_SCALE);
  const [showHeader, setShowHeader]     = useState(true);
  const [headerTitle, setHeaderTitle]   = useState('Tarombo Digital');
  const [customW, setCustomW]           = useState(420);
  const [customH, setCustomH]           = useState(594);
  const [customWErr, setCustomWErr]     = useState('');
  const [customHErr, setCustomHErr]     = useState('');

  // ── Reset to defaults when modal opens ───────────────────
  useEffect(() => {
    if (isOpen) {
      setPaperKey(DEFAULT_PAPER);
      setOrientation(DEFAULT_ORIENT);
      setScaleMode(DEFAULT_SCALE);
      setShowHeader(true);
      setHeaderTitle('Tarombo Digital');
      setCustomW(420);
      setCustomH(594);
      setCustomWErr('');
      setCustomHErr('');
    }
  }, [isOpen]);

  // ── Validation ────────────────────────────────────────────
  const validateCustom = useCallback(
    (w: number, h: number): boolean => {
      let ok = true;
      if (w < CUSTOM_PAPER_MIN_MM || w > CUSTOM_PAPER_MAX_MM) {
        setCustomWErr(
          `Lebar harus antara ${CUSTOM_PAPER_MIN_MM}–${CUSTOM_PAPER_MAX_MM} mm`
        );
        ok = false;
      } else {
        setCustomWErr('');
      }
      if (h < CUSTOM_PAPER_MIN_MM || h > CUSTOM_PAPER_MAX_MM) {
        setCustomHErr(
          `Tinggi harus antara ${CUSTOM_PAPER_MIN_MM}–${CUSTOM_PAPER_MAX_MM} mm`
        );
        ok = false;
      } else {
        setCustomHErr('');
      }
      return ok;
    },
    []
  );

  // ── Build opts snapshot for preview ───────────────────────
  const currentOpts: PdfExportOptions = {
    paperKey,
    customWidth:      customW,
    customHeight:     customH,
    orientation,
    scaleMode,
    showHeader,
    headerTitle,
    exportDate:       new Date().toLocaleDateString('id-ID'),
    totalMembers,
    totalGenerations,
    filename:         `tarombo-digital-${new Date().toISOString().slice(0, 10)}.pdf`,
  };

  const { pageW, pageH } = getEffectivePaperMm(currentOpts);
  const estimatedPages   = estimatePageCount(nodes, currentOpts);

  // ── Handle export button ──────────────────────────────────
  const handleExport = useCallback(() => {
    if (paperKey === 'Custom' && !validateCustom(customW, customH)) return;
    onExport(currentOpts);
  }, [paperKey, customW, customH, validateCustom, onExport, currentOpts]);

  // ── Keyboard: Escape closes modal ────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  // ── Shared styles ─────────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    fontSize:     11,
    fontWeight:   600,
    color:        '#94a3b8',
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 18,
  };

  const radioRow = (
    id: string,
    label: string,
    checked: boolean,
    onChange: () => void
  ) => (
    <label
      key={id}
      htmlFor={id}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           8,
        cursor:        'pointer',
        padding:       '5px 10px',
        borderRadius:  7,
        background:    checked ? 'rgba(99,102,241,0.12)' : 'transparent',
        border:        `1px solid ${checked ? '#6366f1' : 'transparent'}`,
        transition:    'all 0.15s ease',
        marginBottom:  4,
      }}
    >
      <input
        id={id}
        type="radio"
        checked={checked}
        onChange={onChange}
        style={{ accentColor: '#818cf8', cursor: 'pointer' }}
      />
      <span style={{ fontSize: 12, color: checked ? '#e0e7ff' : '#94a3b8' }}>
        {label}
      </span>
    </label>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={!isExporting ? onClose : undefined}
        style={{
          position:        'fixed',
          inset:           0,
          background:      'rgba(0,0,0,0.65)',
          backdropFilter:  'blur(4px)',
          zIndex:          200,
        }}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Export PDF"
        style={{
          position:      'fixed',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%, -50%)',
          zIndex:        201,
          width:         460,
          maxWidth:      '94vw',
          maxHeight:     '92vh',
          overflowY:     'auto',
          background:    '#0f172a',
          border:        '1px solid #1e293b',
          borderRadius:  16,
          boxShadow:     '0 32px 80px rgba(0,0,0,0.7)',
          display:       'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header bar ─────────────────────────────────── */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '16px 20px',
            borderBottom:   '1px solid #1e293b',
            flexShrink:     0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width:        34,
                height:       34,
                borderRadius: 9,
                background:   'linear-gradient(135deg, #6366f1, #818cf8)',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                boxShadow:    '0 0 14px rgba(99,102,241,0.35)',
              }}
            >
              <FileText size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
                Ekspor PDF
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                Pilih ukuran kertas, orientasi, dan skala
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            aria-label="Tutup"
            style={{
              background:   'none',
              border:       '1px solid #334155',
              borderRadius: 8,
              color:        '#64748b',
              cursor:       isExporting ? 'not-allowed' : 'pointer',
              padding:      '5px 7px',
              display:      'flex',
              alignItems:   'center',
              transition:   'all 0.15s ease',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div style={{ padding: '20px', flex: 1 }}>

          {/* Paper Size */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Ukuran Kertas</div>
            <select
              id="pdf-paper-size"
              value={paperKey}
              onChange={(e) => setPaperKey(e.target.value as PaperSizeKey)}
              style={{
                width:        '100%',
                padding:      '8px 12px',
                background:   '#1e293b',
                border:       '1px solid #334155',
                borderRadius: 8,
                color:        '#f1f5f9',
                fontSize:     13,
                cursor:       'pointer',
                outline:      'none',
              }}
            >
              {Object.entries(PAPER_SIZES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>

            {/* Custom size inputs */}
            {paperKey === 'Custom' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ ...labelStyle, marginBottom: 4 }}>Lebar (mm)</div>
                  <input
                    id="pdf-custom-width"
                    type="number"
                    min={CUSTOM_PAPER_MIN_MM}
                    max={CUSTOM_PAPER_MAX_MM}
                    value={customW}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCustomW(v);
                      if (v < CUSTOM_PAPER_MIN_MM || v > CUSTOM_PAPER_MAX_MM) {
                        setCustomWErr(`${CUSTOM_PAPER_MIN_MM}–${CUSTOM_PAPER_MAX_MM} mm`);
                      } else {
                        setCustomWErr('');
                      }
                    }}
                    style={{
                      width:        '100%',
                      padding:      '7px 10px',
                      background:   '#1e293b',
                      border:       `1px solid ${customWErr ? '#ef4444' : '#334155'}`,
                      borderRadius: 7,
                      color:        '#f1f5f9',
                      fontSize:     12,
                      outline:      'none',
                      boxSizing:    'border-box',
                    }}
                  />
                  {customWErr && (
                    <div style={{ fontSize: 10, color: '#f87171', marginTop: 3 }}>
                      {customWErr}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...labelStyle, marginBottom: 4 }}>Tinggi (mm)</div>
                  <input
                    id="pdf-custom-height"
                    type="number"
                    min={CUSTOM_PAPER_MIN_MM}
                    max={CUSTOM_PAPER_MAX_MM}
                    value={customH}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCustomH(v);
                      if (v < CUSTOM_PAPER_MIN_MM || v > CUSTOM_PAPER_MAX_MM) {
                        setCustomHErr(`${CUSTOM_PAPER_MIN_MM}–${CUSTOM_PAPER_MAX_MM} mm`);
                      } else {
                        setCustomHErr('');
                      }
                    }}
                    style={{
                      width:        '100%',
                      padding:      '7px 10px',
                      background:   '#1e293b',
                      border:       `1px solid ${customHErr ? '#ef4444' : '#334155'}`,
                      borderRadius: 7,
                      color:        '#f1f5f9',
                      fontSize:     12,
                      outline:      'none',
                      boxSizing:    'border-box',
                    }}
                  />
                  {customHErr && (
                    <div style={{ fontSize: 10, color: '#f87171', marginTop: 3 }}>
                      {customHErr}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Orientation */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Orientasi</div>
            {radioRow('pdf-orient-portrait',  'Portrait',  orientation === 'portrait',  () => setOrientation('portrait'))}
            {radioRow('pdf-orient-landscape', 'Landscape', orientation === 'landscape', () => setOrientation('landscape'))}
          </div>

          {/* Scale Mode */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Skala</div>
            {radioRow(
              'pdf-scale-fitpage',
              'Fit to Page — seluruh pohon dalam 1 halaman',
              scaleMode === 'fitPage',
              () => setScaleMode('fitPage')
            )}
            {radioRow(
              'pdf-scale-fitwidth',
              'Fit to Width — lebar sesuai kertas, tinggi bisa multi-halaman',
              scaleMode === 'fitWidth',
              () => setScaleMode('fitWidth')
            )}
            {radioRow(
              'pdf-scale-actual',
              'Actual Size — ukuran asli pohon tanpa paksaan skala',
              scaleMode === 'actualSize',
              () => setScaleMode('actualSize')
            )}
          </div>

          {/* Header */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Header PDF</div>
            <label
              htmlFor="pdf-show-header"
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         8,
                cursor:      'pointer',
                marginBottom: 10,
              }}
            >
              <input
                id="pdf-show-header"
                type="checkbox"
                checked={showHeader}
                onChange={(e) => setShowHeader(e.target.checked)}
                style={{ accentColor: '#818cf8', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Tampilkan header</span>
            </label>

            {showHeader && (
              <input
                id="pdf-header-title"
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                maxLength={60}
                placeholder="Judul header…"
                style={{
                  width:        '100%',
                  padding:      '7px 10px',
                  background:   '#1e293b',
                  border:       '1px solid #334155',
                  borderRadius: 7,
                  color:        '#f1f5f9',
                  fontSize:     12,
                  outline:      'none',
                  boxSizing:    'border-box',
                }}
              />
            )}
          </div>

          {/* ── Summary info ─────────────────────────────── */}
          <div
            style={{
              background:   '#1e293b',
              border:       '1px solid #334155',
              borderRadius: 10,
              padding:      '12px 14px',
              marginBottom: 0,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Ringkasan Ekspor
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
              {[
                ['Kertas',       paperKey === 'Custom' ? `Custom (${customW}×${customH} mm)` : PAPER_SIZES[paperKey].label],
                ['Orientasi',    orientation === 'landscape' ? 'Landscape' : 'Portrait'],
                ['Dimensi',      `${Math.round(pageW)} × ${Math.round(pageH)} mm`],
                ['Skala',        scaleMode === 'fitPage' ? 'Fit to Page' : scaleMode === 'fitWidth' ? 'Fit to Width' : 'Actual Size'],
                ['Anggota',      totalMembers.toLocaleString('id-ID')],
                ['Generasi',     totalGenerations.toString()],
                ['Est. Halaman', estimatedPages.toString()],
                ['File',         currentOpts.filename],
              ].map(([k, v]) => (
                <React.Fragment key={k}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{k}</span>
                  <span
                    style={{
                      fontSize:     11,
                      color:        '#f1f5f9',
                      fontWeight:   600,
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                    }}
                    title={v}
                  >
                    {v}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer buttons ──────────────────────────────── */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'flex-end',
            gap:            10,
            padding:        '14px 20px',
            borderTop:      '1px solid #1e293b',
            flexShrink:     0,
          }}
        >
          <button
            id="pdf-modal-cancel"
            onClick={onClose}
            disabled={isExporting}
            style={{
              padding:      '9px 18px',
              borderRadius: 9,
              background:   '#1e293b',
              border:       '1px solid #334155',
              color:        '#94a3b8',
              fontSize:     13,
              fontWeight:   600,
              cursor:       isExporting ? 'not-allowed' : 'pointer',
              transition:   'all 0.15s ease',
            }}
          >
            Batal
          </button>

          <button
            id="pdf-modal-export"
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding:     '9px 22px',
              borderRadius: 9,
              background:  isExporting
                ? '#334155'
                : 'linear-gradient(135deg, #6366f1, #818cf8)',
              border:       'none',
              color:        '#fff',
              fontSize:     13,
              fontWeight:   700,
              cursor:       isExporting ? 'not-allowed' : 'pointer',
              display:      'flex',
              alignItems:   'center',
              gap:          7,
              boxShadow:    isExporting ? 'none' : '0 0 16px rgba(99,102,241,0.35)',
              transition:   'all 0.2s ease',
            }}
          >
            {isExporting ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <FileText size={14} />
            )}
            {isExporting ? 'Mengekspor...' : 'Ekspor PDF'}
          </button>
        </div>
      </div>
    </>
  );
}
