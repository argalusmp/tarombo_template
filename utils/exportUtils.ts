import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import type { Node } from '@xyflow/react';

// ============================================================
// Export Utilities — Phase 2.1
// Provides PNG export and advanced PDF export with paper size,
// orientation, scale mode, and header options.
// ============================================================

const PADDING_RATIO = 0.04; // 4% padding on every side during capture

// ── Internal capture helpers ──────────────────────────────────

/**
 * Calculate pixel dimensions for a capture canvas given the tree bounds.
 * Aims to keep a minimum width of 1400px, aspect-ratio-preserving.
 */
function calcImageDimensions(nodes: Node[]): { imageW: number; imageH: number } {
  const bounds = getNodesBounds(nodes);
  if (bounds.width <= 0 || bounds.height <= 0) {
    return { imageW: 1400, imageH: 900 };
  }
  const MIN_DIM = 1400;
  const MAX_DIM = 16000;
  const rawW = Math.max(bounds.width * 1.1, MIN_DIM);
  const imageW = Math.min(rawW, MAX_DIM);
  const aspect = bounds.height / bounds.width;
  const rawH = Math.max(imageW * aspect * 1.1, MIN_DIM * 0.5);
  const imageH = Math.min(rawH, MAX_DIM);
  return { imageW: Math.ceil(imageW), imageH: Math.ceil(imageH) };
}

/**
 * Capture the full tree (not just what is visible) as a PNG data URL.
 * Uses getViewportForBounds to calculate the correct transform without
 * changing the user's current viewport.
 *
 * @param pixelRatio - Multiplier for raster resolution. Use 2–4 for PDF quality.
 */
async function captureFullTree(
  viewportEl: HTMLElement,
  nodes: Node[],
  pixelRatio: number
): Promise<{ dataUrl: string; imageW: number; imageH: number }> {
  const { imageW, imageH } = calcImageDimensions(nodes);
  const bounds = getNodesBounds(nodes);

  const transform = getViewportForBounds(
    bounds,
    imageW,
    imageH,
    0.01,  // minZoom
    4,     // maxZoom (allow higher zoom for HQ raster)
    PADDING_RATIO
  );

  const dataUrl = await toPng(viewportEl, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: '#0f172a',
    width: imageW,
    height: imageH,
    style: {
      width:           `${imageW}px`,
      height:          `${imageH}px`,
      transform:       `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      transformOrigin: 'top left',
    },
  });

  return { dataUrl, imageW, imageH };
}

// ── PNG Export ────────────────────────────────────────────────

/**
 * Export the full family tree as a high-resolution PNG.
 */
export async function exportPng(
  viewportEl: HTMLElement,
  nodes: Node[],
  filename = 'tarombo-keluarga.png'
): Promise<void> {
  const { dataUrl } = await captureFullTree(viewportEl, nodes, 2);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

// ── PDF Export — Advanced ─────────────────────────────────────

/** ISO paper sizes in mm (portrait: width × height). */
export const PAPER_SIZES: Record<string, { w: number; h: number; label: string }> = {
  A4: { w: 210,  h: 297,  label: 'A4 (210 × 297 mm)' },
  A3: { w: 297,  h: 420,  label: 'A3 (297 × 420 mm)' },
  A2: { w: 420,  h: 594,  label: 'A2 (420 × 594 mm)' },
  A1: { w: 594,  h: 841,  label: 'A1 (594 × 841 mm)' },
  A0: { w: 841,  h: 1189, label: 'A0 (841 × 1189 mm)' },
  Custom: { w: 420, h: 594, label: 'Custom' },
};

export const CUSTOM_PAPER_MIN_MM = 50;
export const CUSTOM_PAPER_MAX_MM = 2000;

export type PaperSizeKey = keyof typeof PAPER_SIZES;
export type PdfOrientation = 'portrait' | 'landscape';
export type PdfScaleMode   = 'fitPage' | 'fitWidth' | 'actualSize';

export interface PdfExportOptions {
  /** Key into PAPER_SIZES (e.g. 'A3', 'Custom') */
  paperKey:        PaperSizeKey;
  /** For Custom paper only: width in mm */
  customWidth:     number;
  /** For Custom paper only: height in mm */
  customHeight:    number;
  orientation:     PdfOrientation;
  scaleMode:       PdfScaleMode;
  showHeader:      boolean;
  headerTitle:     string;
  exportDate:      string;
  totalMembers:    number;
  totalGenerations: number;
  filename:        string;
}

/**
 * Calculate the effective paper dimensions (mm) after applying orientation.
 */
export function getEffectivePaperMm(opts: PdfExportOptions): { pageW: number; pageH: number } {
  const size = PAPER_SIZES[opts.paperKey] ?? PAPER_SIZES.A3;
  const baseW = opts.paperKey === 'Custom' ? opts.customWidth  : size.w;
  const baseH = opts.paperKey === 'Custom' ? opts.customHeight : size.h;
  const isLandscape = opts.orientation === 'landscape';
  return {
    pageW: isLandscape ? Math.max(baseW, baseH) : Math.min(baseW, baseH),
    pageH: isLandscape ? Math.min(baseW, baseH) : Math.max(baseW, baseH),
  };
}

/**
 * Estimate number of PDF pages required.
 * Returns 1 for fitPage, otherwise calculates from tree vs. page dimensions.
 */
export function estimatePageCount(
  nodes: Node[],
  opts: PdfExportOptions
): number {
  if (nodes.length === 0) return 1;
  const bounds = getNodesBounds(nodes);
  if (bounds.width <= 0 || bounds.height <= 0) return 1;

  const { pageW, pageH } = getEffectivePaperMm(opts);
  const MM_PER_PX = 0.26458; // 96 DPI

  const treeW_mm = bounds.width  * MM_PER_PX;
  const treeH_mm = bounds.height * MM_PER_PX;

  if (opts.scaleMode === 'fitPage') return 1;

  if (opts.scaleMode === 'fitWidth') {
    // Scale so tree width fits page width; then measure pages needed vertically
    const scale = pageW / treeW_mm;
    const scaledH = treeH_mm * scale;
    return Math.max(1, Math.ceil(scaledH / pageH));
  }

  // actualSize — how many pages in each direction
  const pagesX = Math.ceil(treeW_mm / pageW);
  const pagesY = Math.ceil(treeH_mm / pageH);
  return pagesX * pagesY;
}

/**
 * Export the family tree to a professional PDF.
 *
 * Resolution strategy:
 *   - Determine paper size in mm
 *   - Convert to pixels at a high DPI (300 DPI = 11.81 px/mm)
 *   - Capture the tree at that pixel size × pixelRatio boost
 *   - Scale and place into jsPDF
 *   - Multi-page for fitWidth / actualSize when tree is tall
 */
export async function exportPdfAdvanced(
  viewportEl: HTMLElement,
  nodes: Node[],
  opts: PdfExportOptions
): Promise<void> {
  if (nodes.length === 0) return;

  const { pageW, pageH } = getEffectivePaperMm(opts);

  // ── Target DPI: 200 for raster clarity at print size ─────
  const EXPORT_DPI = 200;
  const PX_PER_MM  = EXPORT_DPI / 25.4; // px per mm at target DPI

  // How many pixels does one PDF page correspond to at EXPORT_DPI?
  const pagePixW = Math.round(pageW * PX_PER_MM);
  const pagePixH = Math.round(pageH * PX_PER_MM);

  const bounds = getNodesBounds(nodes);
  const treePixW = Math.round(bounds.width  + bounds.width  * PADDING_RATIO * 2);
  const treePixH = Math.round(bounds.height + bounds.height * PADDING_RATIO * 2);

  // ── Header area (in mm, drawn in PDF space) ───────────────
  const HEADER_H_MM = opts.showHeader ? 14 : 0;
  const contentH = pageH - HEADER_H_MM;

  // ── Determine capture dimensions based on scale mode ──────
  let captureW: number;
  let captureH: number;
  let scaledW_mm: number;
  let scaledH_mm: number;

  if (opts.scaleMode === 'fitPage') {
    // Tree fits entirely within one page (content area)
    const contentPixH = Math.round(contentH * PX_PER_MM);
    const scaleX = pagePixW  / treePixW;
    const scaleY = contentPixH / treePixH;
    const scale  = Math.min(scaleX, scaleY);
    captureW = Math.round(treePixW  * scale);
    captureH = Math.round(treePixH * scale);
    scaledW_mm = captureW / PX_PER_MM;
    scaledH_mm = captureH / PX_PER_MM;
  } else if (opts.scaleMode === 'fitWidth') {
    // Tree is scaled to page width; height may exceed one page
    const scale  = pagePixW / treePixW;
    captureW = pagePixW;
    captureH = Math.round(treePixH * scale);
    scaledW_mm = pageW;
    scaledH_mm = captureH / PX_PER_MM;
  } else {
    // actualSize — use tree natural pixel size (no aggressive downscale)
    // Cap at a maximum sensible size
    const MAX_CAP = 20000;
    captureW = Math.min(treePixW, MAX_CAP);
    captureH = Math.min(treePixH, MAX_CAP);
    scaledW_mm = captureW / PX_PER_MM;
    scaledH_mm = captureH / PX_PER_MM;
  }

  // ── Pixel ratio: we already target high DPI via captureW/H.
  //    A pixelRatio of 1.5 boosts further for anti-aliasing. ─
  const pixelRatio = 1.5;

  // ── Capture the tree image ────────────────────────────────
  const transform = getViewportForBounds(
    bounds,
    captureW,
    captureH,
    0.001, // very small minZoom to allow fit of large trees
    8,
    PADDING_RATIO
  );

  const dataUrl = await toPng(viewportEl, {
    cacheBust:       true,
    pixelRatio,
    backgroundColor: '#0f172a',
    width:           captureW,
    height:          captureH,
    style: {
      width:           `${captureW}px`,
      height:          `${captureH}px`,
      transform:       `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      transformOrigin: 'top left',
    },
  });

  // ── Build PDF ─────────────────────────────────────────────
  const pdf = new jsPDF({
    orientation: opts.orientation,
    unit:        'mm',
    format:      [pageW, pageH],
  });

  // Helper: draw header on the current page
  const drawHeader = () => {
    if (!opts.showHeader) return;
    const headerH = HEADER_H_MM;

    // Background bar
    pdf.setFillColor(15, 23, 42);        // #0f172a
    pdf.rect(0, 0, pageW, headerH, 'F');

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(241, 245, 249);    // #f1f5f9
    pdf.text(opts.headerTitle || 'Tarombo Digital', 6, headerH * 0.55);

    // Meta info (right side)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);    // #64748b
    const meta = [
      `Tanggal: ${opts.exportDate}`,
      `Anggota: ${opts.totalMembers.toLocaleString()}`,
      `Generasi: ${opts.totalGenerations}`,
    ].join('   ·   ');
    pdf.text(meta, pageW - 6, headerH * 0.55, { align: 'right' });

    // Bottom rule
    pdf.setDrawColor(30, 41, 59);       // #1e293b
    pdf.setLineWidth(0.3);
    pdf.line(0, headerH, pageW, headerH);
  };

  const totalHeightNeeded = scaledH_mm;
  const pageCount = Math.max(1, Math.ceil(totalHeightNeeded / contentH));

  for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
    if (pageIdx > 0) pdf.addPage([pageW, pageH], opts.orientation);

    drawHeader();

    // Vertical offset into the image for this page (in mm)
    const sliceTop_mm = pageIdx * contentH;

    // The portion of the image to show on this page
    const sliceH_mm = Math.min(contentH, totalHeightNeeded - sliceTop_mm);

    // x position: center horizontally if tree is narrower than page
    const xOffset_mm = Math.max(0, (pageW - scaledW_mm) / 2);
    const yOffset_mm = HEADER_H_MM;

    if (pageCount === 1) {
      // Single page: center the image both axes
      const yCenter = HEADER_H_MM + Math.max(0, (contentH - sliceH_mm) / 2);
      pdf.addImage(
        dataUrl,
        'PNG',
        xOffset_mm,
        yCenter,
        scaledW_mm,
        scaledH_mm,
        undefined,
        'FAST'
      );
    } else {
      // Multi-page: shift image so the correct slice appears on this page
      // jsPDF clips drawing to the page, so we simply offset upward
      const imageY = yOffset_mm - sliceTop_mm;
      pdf.addImage(
        dataUrl,
        'PNG',
        xOffset_mm,
        imageY,
        scaledW_mm,
        scaledH_mm,
        undefined,
        'FAST'
      );
    }
  }

  pdf.save(opts.filename);
}

// ── Backward-compat simple PDF export ────────────────────────

/**
 * Simple PDF export kept for backward compatibility.
 * Produces a custom-sized page that fits the entire tree.
 */
export async function exportPdf(
  viewportEl: HTMLElement,
  nodes: Node[],
  filename = 'tarombo-keluarga.pdf'
): Promise<void> {
  const { dataUrl, imageW, imageH } = await captureFullTree(viewportEl, nodes, 1.5);
  const PX_TO_MM = 0.26458;
  const pdfW = Math.ceil(imageW * PX_TO_MM);
  const pdfH = Math.ceil(imageH * PX_TO_MM);

  const pdf = new jsPDF({
    orientation: pdfW >= pdfH ? 'landscape' : 'portrait',
    unit:        'mm',
    format:      [pdfW, pdfH],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH);
  pdf.save(filename);
}
