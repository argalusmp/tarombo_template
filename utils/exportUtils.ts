import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// ============================================================
// Export Utilities
// ============================================================

/**
 * Export the React Flow canvas as a high-resolution PNG.
 */
export async function exportPng(
  viewportElement: HTMLElement,
  filename = 'tarombo-family-tree.png'
): Promise<void> {
  const dataUrl = await toPng(viewportElement, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#0f172a',
    style: {
      borderRadius: '0',
    },
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Export the React Flow canvas as a long PDF.
 * Tiles the image across pages if it exceeds one A4 height.
 */
export async function exportPdf(
  viewportElement: HTMLElement,
  filename = 'tarombo-family-tree.pdf'
): Promise<void> {
  const dataUrl = await toPng(viewportElement, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#0f172a',
  });

  const img = new Image();
  img.src = dataUrl;

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  const imgWidthPx = img.width;
  const imgHeightPx = img.height;

  // A4 in mm at 96dpi: 210mm wide = 794px, 297mm tall = 1123px
  const pdfWidth = 210; // mm
  const pxPerMm = imgWidthPx / pdfWidth;
  const imgHeightMm = imgHeightPx / pxPerMm;

  const pageHeightMm = 297;

  const pdf = new jsPDF({
    orientation: imgHeightMm > imgWidthPx ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  let remainingHeight = imgHeightMm;
  let yOffset = 0;

  while (remainingHeight > 0) {
    const sliceHeight = Math.min(pageHeightMm, remainingHeight);

    if (yOffset > 0) pdf.addPage();

    pdf.addImage(
      dataUrl,
      'PNG',
      0,
      -yOffset,
      pdfWidth,
      imgHeightMm
    );

    yOffset += sliceHeight;
    remainingHeight -= sliceHeight;
  }

  pdf.save(filename);
}
