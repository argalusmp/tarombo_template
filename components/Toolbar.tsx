'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Upload,
  Download,
  Search,
  Image as ImageIcon,
  FileText,
  X,
  Loader2,
  Users,
  BarChart2,
  Filter,
  BookOpen,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import type { TaromboPerson } from '@/types/tarombo';
import type { SearchResult } from '@/hooks/useSearch';

// ============================================================
// Toolbar (Phase 2 enhanced)
// ============================================================

interface ToolbarProps {
  isLoading: boolean;
  isExporting: boolean;
  fileName: string | null;
  hasTree: boolean;
  hasFocus: boolean;
  persons: TaromboPerson[];
  searchQuery: string;
  searchResults: SearchResult[];
  onSearchChange: (q: string) => void;
  onSearchSelect: (person: TaromboPerson) => void;
  onSearchClear: () => void;
  onUpload: (file: File) => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  onToggleStats: () => void;
  onToggleFilter: () => void;
  onToggleLegend: () => void;
  onResetFocus: () => void;
  onExpandAll: () => void;
  showStats: boolean;
  showFilter: boolean;
  showLegend: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function Toolbar({
  isLoading,
  isExporting,
  fileName,
  hasTree,
  hasFocus,
  persons,
  searchQuery,
  searchResults,
  onSearchChange,
  onSearchSelect,
  onSearchClear,
  onUpload,
  onExportPng,
  onExportPdf,
  onToggleStats,
  onToggleFilter,
  onToggleLegend,
  onResetFocus,
  onExpandAll,
  showStats,
  showFilter,
  showLegend,
  searchInputRef,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
        e.target.value = '';
      }
    },
    [onUpload]
  );

  useEffect(() => {
    setIsSearchOpen(searchQuery.length > 0 && searchResults.length > 0);
  }, [searchQuery, searchResults]);

  const isDisabled = isLoading || isExporting;

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const iconBtnStyle = (active?: boolean): React.CSSProperties => ({
    ...btnBase,
    padding: '7px 11px',
    background: active ? 'rgba(99, 102, 241, 0.2)' : '#1e293b',
    color: active ? '#818cf8' : '#64748b',
    border: `1px solid ${active ? '#6366f1' : '#334155'}`,
  });

  return (
    <div
      style={{
        height: 52,
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: 6,
        flexShrink: 0,
        position: 'relative',
        zIndex: 9,
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        id="excel-file-input"
      />

      {/* Upload */}
      <button
        id="btn-upload"
        onClick={() => fileInputRef.current?.click()}
        disabled={isDisabled}
        style={{
          ...btnBase,
          background: 'linear-gradient(135deg, #818cf8, #6366f1)',
          color: '#fff',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
          opacity: isDisabled ? 0.7 : 1,
        }}
      >
        {isLoading && !isExporting ? (
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <Upload size={14} />
        )}
        {isLoading && !isExporting ? 'Membaca...' : 'Unggah Excel'}
      </button>

      {/* Download template */}
      <a
        href="/Tarombo_Template.xlsx"
        download="Tarombo_Template.xlsx"
        id="btn-download-template"
        style={{
          ...btnBase,
          background: '#1e293b',
          color: '#64748b',
          border: '1px solid #334155',
          textDecoration: 'none',
          pointerEvents: isDisabled ? 'none' : 'auto',
          opacity: isDisabled ? 0.7 : 1,
        }}
      >
        <Download size={14} />
        Template
      </a>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: '#1e293b', margin: '0 2px' }} />

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '0 10px',
            gap: 8,
            height: 34,
          }}
        >
          <Search size={13} color="#475569" />
          <input
            ref={searchInputRef}
            id="search-input"
            type="text"
            placeholder={
              hasTree
                ? `Cari dari ${persons.length} anggota…`
                : 'Unggah file terlebih dahulu'
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={!hasTree || isDisabled}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f1f5f9',
              fontSize: 12,
              fontFamily: 'inherit',
              cursor: !hasTree || isDisabled ? 'not-allowed' : 'text',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                onSearchClear();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {isSearchOpen && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              zIndex: 100,
              maxHeight: 320,
              overflowY: 'auto',
            }}
          >
            {searchResults.map((result) => (
              <button
                key={result.person.id}
                onClick={() => {
                  onSearchSelect(result.person);
                  setIsSearchOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: '1px solid #0f172a',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = '#334155')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = 'none')
                }
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background:
                      result.person.gender === 'L'
                        ? 'rgba(59,130,246,0.2)'
                        : 'rgba(236,72,153,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Users
                    size={12}
                    color={result.person.gender === 'L' ? '#60a5fa' : '#f472b6'}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>
                    {result.person.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>
                    ID: {result.person.id}
                    {result.person.marga ? ` · ${result.person.marga}` : ''}
                    {` · Gen ${result.person.generationComputed}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filename badge */}
      {fileName && (
        <div
          style={{
            fontSize: 10,
            color: '#64748b',
            padding: '3px 9px',
            background: '#1e293b',
            borderRadius: 6,
            border: '1px solid #334155',
            maxWidth: 140,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          title={fileName}
        >
          📄 {fileName}
        </div>
      )}

      {/* Flex spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Phase 2 action buttons ── */}

      {hasTree && (
        <>
          {/* Statistics */}
          <button
            id="btn-stats"
            onClick={onToggleStats}
            title="Panel Statistik"
            style={iconBtnStyle(showStats)}
            onMouseEnter={(e) => {
              if (!showStats) {
                (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
                (e.currentTarget as HTMLButtonElement).style.background = '#334155';
              }
            }}
            onMouseLeave={(e) => {
              if (!showStats) {
                (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
              }
            }}
          >
            <BarChart2 size={14} />
          </button>

          {/* Filter */}
          <button
            id="btn-filter"
            onClick={onToggleFilter}
            title="Panel Filter"
            style={iconBtnStyle(showFilter)}
            onMouseEnter={(e) => {
              if (!showFilter) {
                (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
                (e.currentTarget as HTMLButtonElement).style.background = '#334155';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilter) {
                (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
              }
            }}
          >
            <Filter size={14} />
          </button>

          {/* Legend */}
          <button
            id="btn-legend"
            onClick={onToggleLegend}
            title="Legenda Warna"
            style={iconBtnStyle(showLegend)}
            onMouseEnter={(e) => {
              if (!showLegend) {
                (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
                (e.currentTarget as HTMLButtonElement).style.background = '#334155';
              }
            }}
            onMouseLeave={(e) => {
              if (!showLegend) {
                (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
              }
            }}
          >
            <BookOpen size={14} />
          </button>

          {/* Expand All */}
          <button
            id="btn-expand-all"
            onClick={onExpandAll}
            title="Tampilkan Semua Node"
            style={iconBtnStyle(false)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
              (e.currentTarget as HTMLButtonElement).style.background = '#334155';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
              (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
            }}
          >
            <TrendingUp size={14} />
          </button>

          {/* Reset Focus (only when in focus mode) */}
          {hasFocus && (
            <button
              id="btn-reset-focus"
              onClick={onResetFocus}
              title="Reset Focus Silsilah"
              style={{
                ...btnBase,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(239, 68, 68, 0.25)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(239, 68, 68, 0.12)';
              }}
            >
              <RefreshCw size={13} />
              Reset Focus
            </button>
          )}

          <div style={{ width: 1, height: 24, background: '#1e293b', margin: '0 2px' }} />
        </>
      )}

      {/* Export PNG */}
      <button
        id="btn-export-png"
        onClick={onExportPng}
        disabled={!hasTree || isDisabled}
        title="Ekspor sebagai PNG"
        style={{
          ...btnBase,
          background: hasTree && !isDisabled ? '#1e293b' : '#0f172a',
          color: hasTree && !isDisabled ? '#64748b' : '#334155',
          border: `1px solid ${hasTree && !isDisabled ? '#334155' : '#1e293b'}`,
          cursor: hasTree && !isDisabled ? 'pointer' : 'not-allowed',
        }}
      >
        {isExporting ? (
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <ImageIcon size={14} />
        )}
        PNG
      </button>

      {/* Export PDF */}
      <button
        id="btn-export-pdf"
        onClick={onExportPdf}
        disabled={!hasTree || isDisabled}
        title="Ekspor sebagai PDF"
        style={{
          ...btnBase,
          background: hasTree && !isDisabled ? '#1e293b' : '#0f172a',
          color: hasTree && !isDisabled ? '#64748b' : '#334155',
          border: `1px solid ${hasTree && !isDisabled ? '#334155' : '#1e293b'}`,
          cursor: hasTree && !isDisabled ? 'pointer' : 'not-allowed',
        }}
      >
        {isExporting ? (
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <FileText size={14} />
        )}
        PDF
      </button>
    </div>
  );
}
