'use client';

import React, { useRef, useCallback, useState } from 'react';

import Header from '@/components/Header';
import Toolbar from '@/components/Toolbar';
import TreeCanvas, { type TreeCanvasHandle } from '@/components/TreeCanvas';
import EmptyState from '@/components/EmptyState';
import ValidationPanel from '@/components/ValidationPanel';
import StatsBar from '@/components/StatsBar';

// Phase 2 panels
import PersonDetailPanel from '@/components/PersonDetailPanel';
import FocusBreadcrumb from '@/components/FocusBreadcrumb';
import StatisticsPanel from '@/components/StatisticsPanel';
import FilterPanel from '@/components/FilterPanel';
import LegendPanel from '@/components/LegendPanel';

import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useSearch } from '@/hooks/useSearch';
import { exportPng, exportPdfAdvanced, type PdfExportOptions } from '@/utils/exportUtils';
import type { TaromboPerson } from '@/types/tarombo';
import PdfExportModal from '@/components/PdfExportModal';

// ============================================================
// Halaman Utama — Phase 2
// ============================================================

export default function HomePage() {
  const treeCanvasRef = useRef<TreeCanvasHandle>(null);
  const [showValidation, setShowValidation] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // ── UI panel toggles ─────────────────────────────────────
  const [showStats, setShowStats] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const {
    isLoading,
    fileName,
    treeData,
    nodes,
    edges,
    error,
    selectedPerson,
    focusedLineage,
    filters,
    extendedStats,
    personMap,
    hasFocus,
    loadFile,
    highlightPersons,
    clearHighlight,
    selectPerson,
    focusLineage,
    resetFocus,
    exploreRelations,
    toggleCollapse,
    expandAll,
    setFilters,
    resetFilters,
  } = useFamilyTree();

  const { query, setQuery, results, clear: clearSearch, inputRef: searchInputRef } = useSearch(
    treeData?.persons ?? []
  );

  const hasTree = nodes.length > 0;

  // ── Upload ──────────────────────────────────────────────
  const handleUpload = useCallback(
    (file: File) => {
      setShowValidation(true);
      setExportError(null);
      loadFile(file);
    },
    [loadFile]
  );

  const triggerFileInput = useCallback(() => {
    document.getElementById('excel-file-input')?.click();
  }, []);

  // ── Node click → open detail panel ──────────────────────
  const handleNodeSelect = useCallback(
    (person: TaromboPerson) => {
      selectPerson(person);
      setShowDetailPanel(true);
    },
    [selectPerson]
  );

  // ── Close detail panel ────────────────────────────────────
  const handleCloseDetail = useCallback(() => {
    setShowDetailPanel(false);
  }, []);

  // ── Fokus Tarombo ────────────────────────────────────────
  const handleFocusLineage = useCallback(
    (person: TaromboPerson) => {
      focusLineage(person.id);
    },
    [focusLineage]
  );

  // ── Explore relations ────────────────────────────────────
  const handleExploreRelations = useCallback(
    (person: TaromboPerson) => {
      exploreRelations(person.id);
    },
    [exploreRelations]
  );

  // ── Reset focus ──────────────────────────────────────────
  const handleResetFocus = useCallback(() => {
    resetFocus();
    clearHighlight();
  }, [resetFocus, clearHighlight]);

  // ── Search select ────────────────────────────────────────
  const handleSearchSelect = useCallback(
    (person: TaromboPerson) => {
      const ids = new Set([person.id]);
      highlightPersons(ids);
      setQuery(person.name);
      // Open detail panel
      selectPerson(person);
      setShowDetailPanel(true);
      // Center on node
      setTimeout(() => {
        treeCanvasRef.current?.focusOnNode(person.id);
      }, 100);
    },
    [highlightPersons, setQuery, selectPerson]
  );

  const handleSearchClear = useCallback(() => {
    clearHighlight();
    clearSearch();
  }, [clearHighlight, clearSearch]);

  // ── Breadcrumb click ─────────────────────────────────────
  const handleBreadcrumbSelect = useCallback(
    (person: TaromboPerson) => {
      selectPerson(person);
      setShowDetailPanel(true);
      treeCanvasRef.current?.focusOnNode(person.id);
    },
    [selectPerson]
  );

  // ── Export ───────────────────────────────────────────────
  const handleExportPng = useCallback(async () => {
    const viewportEl = treeCanvasRef.current?.getViewportElement();
    const allNodes = treeCanvasRef.current?.getNodes() ?? [];
    if (!viewportEl || allNodes.length === 0) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await exportPng(viewportEl, allNodes);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Gagal mengekspor PNG');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Opens the PDF export modal — actual export is in handlePdfExport
  const handleExportPdf = useCallback(() => {
    if (!nodes.length) return;
    setShowPdfModal(true);
  }, [nodes.length]);

  // Called by the modal with user-chosen options
  const handlePdfExport = useCallback(
    async (opts: PdfExportOptions) => {
      const viewportEl = treeCanvasRef.current?.getViewportElement();
      const allNodes = treeCanvasRef.current?.getNodes() ?? [];
      if (!viewportEl || allNodes.length === 0) return;
      setIsExporting(true);
      setExportError(null);
      try {
        await exportPdfAdvanced(viewportEl, allNodes, opts);
        setShowPdfModal(false);
      } catch (err) {
        setExportError(err instanceof Error ? err.message : 'Gagal mengekspor PDF');
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  // ── Father name lookup ───────────────────────────────────
  const fatherName = selectedPerson?.fatherId
    ? personMap.get(selectedPerson.fatherId)?.name ?? null
    : null;

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
        isExporting={isExporting}
        fileName={fileName}
        hasTree={hasTree}
        hasFocus={hasFocus}
        persons={treeData?.persons ?? []}
        searchQuery={query}
        searchResults={results}
        onSearchChange={setQuery}
        onSearchSelect={handleSearchSelect}
        onSearchClear={handleSearchClear}
        onUpload={handleUpload}
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
        onToggleStats={() => setShowStats((v) => !v)}
        onToggleFilter={() => setShowFilter((v) => !v)}
        onToggleLegend={() => setShowLegend((v) => !v)}
        onResetFocus={handleResetFocus}
        onExpandAll={expandAll}
        showStats={showStats}
        showFilter={showFilter}
        showLegend={showLegend}
        searchInputRef={searchInputRef}
      />

      {/* Main canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!hasTree && !isLoading ? (
          <EmptyState onUploadClick={triggerFileInput} />
        ) : (
          <>
            <TreeCanvas
              ref={treeCanvasRef}
              nodes={nodes}
              edges={edges}
              onNodeSelect={handleNodeSelect}
            />

            {/* ── Phase 2 panels ── */}

            {/* Statistics panel */}
            {extendedStats && showStats && (
              <StatisticsPanel
                stats={extendedStats}
                onClose={() => setShowStats(false)}
              />
            )}

            {/* Filter panel */}
            {treeData && showFilter && (
              <FilterPanel
                filters={filters}
                persons={treeData.persons}
                hasLineage={focusedLineage.length > 0}
                onFilterChange={setFilters}
                onReset={resetFilters}
                onClose={() => setShowFilter(false)}
              />
            )}

            {/* Legend */}
            {showLegend && <LegendPanel onClose={() => setShowLegend(false)} />}

            {/* Breadcrumb */}
            {focusedLineage.length > 0 && (
              <FocusBreadcrumb
                lineagePath={focusedLineage}
                personMap={personMap}
                onSelectPerson={handleBreadcrumbSelect}
                onReset={handleResetFocus}
              />
            )}

            {/* Stats bar (top center) */}
            {treeData && <StatsBar treeData={treeData} />}

            {/* Validation panel */}
            {treeData && treeData.errors.length > 0 && showValidation && (
              <ValidationPanel
                errors={treeData.errors}
                onDismiss={() => setShowValidation(false)}
              />
            )}
          </>
        )}

        {/* Loading overlay */}
        {(isLoading || isExporting) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 15, 30, 0.85)',
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
              {isExporting ? 'Menyiapkan ekspor, harap tunggu...' : 'Membangun pohon keluarga...'}
            </div>
            {isExporting && (
              <div style={{ color: '#64748b', fontSize: 12, maxWidth: 300, textAlign: 'center' }}>
                Proses ini mungkin membutuhkan beberapa detik untuk pohon yang besar
              </div>
            )}
          </div>
        )}

        {/* Toast error */}
        {(error || exportError) && (
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
              maxWidth: 500,
              textAlign: 'center',
            }}
          >
            ⚠️ {error ?? exportError}
          </div>
        )}
      </div>

      {/* Person Detail Panel (right sidebar — outside canvas so it overlaps correctly) */}
      <PersonDetailPanel
        person={selectedPerson}
        fatherName={fatherName}
        isOpen={showDetailPanel}
        onClose={handleCloseDetail}
        onFocusLineage={handleFocusLineage}
        onExploreRelations={handleExploreRelations}
      />

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={showPdfModal}
        isExporting={isExporting}
        nodes={treeCanvasRef.current?.getNodes() ?? []}
        totalMembers={treeData?.persons.length ?? 0}
        totalGenerations={treeData?.stats.generations ?? 0}
        onClose={() => setShowPdfModal(false)}
        onExport={handlePdfExport}
      />
    </div>
  );
}
