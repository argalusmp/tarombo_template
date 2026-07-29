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
} from 'lucide-react';
import type { TaromboPerson } from '@/types/tarombo';
import type { SearchResult } from '@/hooks/useSearch';

// ============================================================
// Toolbar
// ============================================================

interface ToolbarProps {
  isLoading: boolean;
  fileName: string | null;
  hasTree: boolean;
  persons: TaromboPerson[];
  searchQuery: string;
  searchResults: SearchResult[];
  onSearchChange: (q: string) => void;
  onSearchSelect: (person: TaromboPerson) => void;
  onSearchClear: () => void;
  onUpload: (file: File) => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function Toolbar({
  isLoading,
  fileName,
  hasTree,
  persons,
  searchQuery,
  searchResults,
  onSearchChange,
  onSearchSelect,
  onSearchClear,
  onUpload,
  onExportPng,
  onExportPdf,
  searchInputRef,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
        // Reset input so same file can be re-uploaded
        e.target.value = '';
      }
    },
    [onUpload]
  );

  useEffect(() => {
    if (searchQuery.length > 0) setIsSearchOpen(true);
    else setIsSearchOpen(false);
  }, [searchQuery]);

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={{
        height: 56,
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
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

      {/* Upload Button */}
      <button
        id="btn-upload"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        style={{
          ...btnBase,
          background: 'linear-gradient(135deg, #818cf8, #6366f1)',
          color: '#fff',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? (
          <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <Upload size={15} />
        )}
        {isLoading ? 'Reading...' : 'Upload Excel'}
      </button>

      {/* Download Template */}
      <a
        href="/Tarombo_Template.xlsx"
        download="Tarombo_Template.xlsx"
        id="btn-download-template"
        style={{
          ...btnBase,
          background: '#1e293b',
          color: '#94a3b8',
          border: '1px solid #334155',
          textDecoration: 'none',
        }}
      >
        <Download size={15} />
        Template
      </a>

      {/* Separator */}
      <div style={{ width: 1, height: 28, background: '#1e293b', margin: '0 4px' }} />

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '0 10px',
            gap: 8,
            height: 36,
          }}
        >
          <Search size={14} color="#475569" />
          <input
            ref={searchInputRef}
            id="search-input"
            type="text"
            placeholder={hasTree ? `Search ${persons.length} members...` : 'Upload a file first'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={!hasTree}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f1f5f9',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: hasTree ? 'text' : 'not-allowed',
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
              <X size={13} />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
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
              maxHeight: 300,
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
                  <Users size={13} color={result.person.gender === 'L' ? '#60a5fa' : '#f472b6'} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>
                    {result.person.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
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

      {/* File name indicator */}
      {fileName && (
        <div
          style={{
            fontSize: 11,
            color: '#64748b',
            padding: '4px 10px',
            background: '#1e293b',
            borderRadius: 6,
            border: '1px solid #334155',
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={fileName}
        >
          📄 {fileName}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Export PNG */}
      <button
        id="btn-export-png"
        onClick={onExportPng}
        disabled={!hasTree || isLoading}
        title="Export as PNG"
        style={{
          ...btnBase,
          background: hasTree ? '#1e293b' : '#0f172a',
          color: hasTree ? '#94a3b8' : '#334155',
          border: `1px solid ${hasTree ? '#334155' : '#1e293b'}`,
          cursor: hasTree ? 'pointer' : 'not-allowed',
        }}
      >
        <ImageIcon size={15} />
        PNG
      </button>

      {/* Export PDF */}
      <button
        id="btn-export-pdf"
        onClick={onExportPdf}
        disabled={!hasTree || isLoading}
        title="Export as PDF"
        style={{
          ...btnBase,
          background: hasTree ? '#1e293b' : '#0f172a',
          color: hasTree ? '#94a3b8' : '#334155',
          border: `1px solid ${hasTree ? '#334155' : '#1e293b'}`,
          cursor: hasTree ? 'pointer' : 'not-allowed',
        }}
      >
        <FileText size={15} />
        PDF
      </button>
    </div>
  );
}
