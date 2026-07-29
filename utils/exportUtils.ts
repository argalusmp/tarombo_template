import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import type { Node } from '@xyflow/react';

// ============================================================
// Export Utilities — menggunakan getNodesBounds + getViewportForBounds
// agar seluruh tree (bukan hanya yang terlihat) ikut tercapture
// ============================================================

const PADDING_RATIO = 0.05; // 5% padding di setiap sisi
const MIN_IMAGE_DIM = 1400;
const MAX_IMAGE_DIM = 10000;

/**
 * Hitung dimensi output image berdasarkan bounding box semua node.
 */
function calcImageDimensions(nodes: Node[]): { imageW: number; imageH: number } {
  const bounds = getNodesBounds(nodes);

  // Tentukan lebar output berdasarkan jumlah node
  const rawW = Math.max(bounds.width + 120, MIN_IMAGE_DIM);
  const imageW = Math.min(rawW, MAX_IMAGE_DIM);

  // Jaga rasio aspek
  const aspectRatio = bounds.height > 0 ? bounds.height / bounds.width : 1;
  const rawH = Math.max(imageW * aspectRatio + 120, MIN_IMAGE_DIM);
  const imageH = Math.min(rawH, MAX_IMAGE_DIM);

  return { imageW: Math.ceil(imageW), imageH: Math.ceil(imageH) };
}

/**
 * Ambil data URL PNG dari seluruh pohon keluarga (bukan hanya viewport yang terlihat).
 * Teknik: override style transform viewport element saat capture menggunakan
 * getViewportForBounds — tidak perlu merubah tampilan yang sedang ditampilkan user.
 */
async function captureFullTree(
  viewportEl: HTMLElement,
  nodes: Node[],
  pixelRatio: number
): Promise<{ dataUrl: string; imageW: number; imageH: number }> {
  const { imageW, imageH } = calcImageDimensions(nodes);
  const bounds = getNodesBounds(nodes);

  // Hitung transform yang tepat agar seluruh tree masuk ke dalam imageW x imageH
  const transform = getViewportForBounds(
    bounds,
    imageW,
    imageH,
    0.01,  // minZoom
    2,     // maxZoom
    PADDING_RATIO
  );

  const dataUrl = await toPng(viewportEl, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: '#0f172a',
    width: imageW,
    height: imageH,
    // Override style hanya saat capture — tidak mengubah tampilan di layar
    style: {
      width: `${imageW}px`,
      height: `${imageH}px`,
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      transformOrigin: 'top left',
    },
  });

  return { dataUrl, imageW, imageH };
}

/**
 * Ekspor pohon keluarga sebagai PNG resolusi tinggi.
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

/**
 * Ekspor pohon keluarga sebagai PDF dengan ukuran halaman menyesuaikan tree.
 * Menggunakan custom page size sehingga tidak ada konten yang terpotong.
 */
export async function exportPdf(
  viewportEl: HTMLElement,
  nodes: Node[],
  filename = 'tarombo-keluarga.pdf'
): Promise<void> {
  // Gunakan pixelRatio=1.5 untuk keseimbangan kualitas & ukuran file
  const { dataUrl, imageW, imageH } = await captureFullTree(viewportEl, nodes, 1.5);

  // Konversi pixel → mm (96 DPI: 1px = 0.26458mm)
  const PX_TO_MM = 0.26458;
  const pdfW = Math.ceil(imageW * PX_TO_MM);
  const pdfH = Math.ceil(imageH * PX_TO_MM);

  const pdf = new jsPDF({
    orientation: pdfW >= pdfH ? 'landscape' : 'portrait',
    unit: 'mm',
    // Custom page size — menyesuaikan dimensi tree, bukan A4 fixed
    format: [pdfW, pdfH],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH);
  pdf.save(filename);
}
