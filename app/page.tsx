'use client';

import React, { useRef, useCallback, useState } from 'react';

import Header from '@/components/Header';
import Toolbar from '@/components/Toolbar';
import TreeCanvas, { type TreeCanvasHandle } from '@/components/TreeCanvas';
import EmptyState from '@/components/EmptyState';
import ValidationPanel from '@/components/ValidationPanel';
import StatsBar from '@/components/StatsBar';

import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useSearch } from '@/hooks/useSearch';
import { exportPng, exportPdf } from '@/utils/exportUtils';
import type { TaromboPerson, PersonNodeData } from '@/types/tarombo';

// ============================================================
// Home Page
// ============================================================

export default function HomePage() {
  const treeCanvasRef = useRef<TreeCanvasHandle>(null);
  const fileInputTriggerRef = useRef<HTMLButtonElement>(null);
  const [showValidation, setShowValidation] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const {
    isLoading,
    fileName,
    treeData,
    nodes,
    edges,
    error,
    loadFile,
    highlightPersons,
    clearHighlight,
  } = useFamilyTree();

  const { query, setQuery, results, clear: clearSearch, inputRef: searchInputRef } = useSearch(
    treeData?.persons ?? []
  );

  const hasTree = nodes.length > 0;

  // ── Upload ─────────────────────────────────────────────────
  const handleUpload = useCallback(
    (file: File) => {
      setShowValidation(true);
      loadFile(file);
    },
    [loadFile]
  );

  const triggerFileInput = useCallback(() => {
    document.getElementById('excel-file-input')?.click();
  }, []);

  // ── Search select → pan to node ───────────────────────────
  const handleSearchSelect = useCallback(
    (person: TaromboPerson) => {
      const ids = new Set([person.id]);
      highlightPersons(ids);
      setQuery(person.name);
    },
    [highlightPersons, setQuery]
  );

  const handleSearchClear = useCallback(() => {
    clearHighlight();
    clearSearch();
  }, [clearHighlight, clearSearch]);

  // ── Export ─────────────────────────────────────────────────
  const handleExportPng = useCallback(async () => {
    const el = treeCanvasRef.current?.getViewportElement();
    if (!el) return;
    setIsExporting(true);
    try {
      await exportPng(el);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleExportPdf = useCallback(async () => {
    const el = treeCanvasRef.current?.getViewportElement();
    if (!el) return;
    setIsExporting(true);
    try {
      await exportPdf(el);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0a0f1e',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      <Header />
      <Toolbar
        isLoading={isLoading || isExporting}
        fileName={fileName}
        hasTree={hasTree}
        persons={treeData?.persons ?? []}
        searchQuery={query}
        searchResults={results}
        onSearchChange={setQuery}
        onSearchSelect={handleSearchSelect}
        onSearchClear={handleSearchClear}
        onUpload={handleUpload}
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
        searchInputRef={searchInputRef}
      />

      {/* Main canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!hasTree && !isLoading ? (
          <EmptyState onUploadClick={triggerFileInput} />
        ) : (
          <>
            <TreeCanvas ref={treeCanvasRef} nodes={nodes} edges={edges} />

            {treeData && <StatsBar treeData={treeData} />}

            {treeData && treeData.errors.length > 0 && showValidation && (
              <ValidationPanel
                errors={treeData.errors}
                onDismiss={() => setShowValidation(false)}
              />
            )}
          </>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 15, 30, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              zIndex: 20,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '3px solid #1e293b',
                borderTopColor: '#818cf8',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
              Building family tree...
            </div>
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b',
              border: '1px solid #ef4444',
              borderRadius: 10,
              padding: '12px 20px',
              fontSize: 13,
              color: '#ef4444',
              zIndex: 50,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}
