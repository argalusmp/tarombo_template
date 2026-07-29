import * as XLSX from 'xlsx';
import type { TaromboRawRow, TaromboPerson, ValidationError } from '@/types/tarombo';

// ============================================================
// Parser Excel — membaca sheet "Tarombo" dari workbook XLSX
// ============================================================

const SHEET_NAME = 'Tarombo';

function normalizeId(val: unknown): string | null {
  if (val === null || val === undefined || val === '') return null;
  const str = String(val).trim();
  if (str === '') return null;
  return str;
}

function normalizeString(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str === '' ? null : str;
}

function normalizeGender(val: unknown): 'L' | 'P' | 'unknown' {
  const str = String(val ?? '').trim().toUpperCase();
  if (str === 'L') return 'L';
  if (str === 'P') return 'P';
  return 'unknown';
}

function normalizeNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export interface ParseResult {
  persons: TaromboPerson[];
  errors: ValidationError[];
}

export function parseExcelFile(file: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(file, { type: 'array' });
  const errors: ValidationError[] = [];

  // Periksa keberadaan sheet
  if (!workbook.SheetNames.includes(SHEET_NAME)) {
    errors.push({
      type: 'INVALID_DATA_TYPE',
      severity: 'error',
      message: `Sheet "${SHEET_NAME}" tidak ditemukan. Sheet yang tersedia: ${workbook.SheetNames.join(', ')}`,
    });
    return { persons: [], errors };
  }

  const worksheet = workbook.Sheets[SHEET_NAME];
  const rawRows = XLSX.utils.sheet_to_json<TaromboRawRow>(worksheet, {
    defval: null,
    raw: true,
  });

  if (rawRows.length === 0) {
    errors.push({
      type: 'MISSING_ROOT',
      severity: 'error',
      message: 'Sheet Tarombo kosong. Tidak ada data yang ditemukan.',
    });
    return { persons: [], errors };
  }

  const persons: TaromboPerson[] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Baris Excel (header = baris 1)

    // Validasi ID
    const rawId = row['ID'];
    if (rawId === null || rawId === undefined || String(rawId).trim() === '') {
      errors.push({
        type: 'INVALID_DATA_TYPE',
        severity: 'error',
        row: rowNum,
        field: 'ID',
        message: `Baris ${rowNum}: ID tidak ada atau kosong.`,
      });
      return;
    }

    if (isNaN(Number(rawId))) {
      errors.push({
        type: 'INVALID_DATA_TYPE',
        severity: 'error',
        row: rowNum,
        field: 'ID',
        message: `Baris ${rowNum}: ID "${rawId}" bukan angka yang valid.`,
      });
      return;
    }

    // Validasi Father ID (opsional, tapi harus angka jika diisi)
    const rawFatherId = row['Father ID'];
    if (
      rawFatherId !== null &&
      rawFatherId !== undefined &&
      String(rawFatherId).trim() !== '' &&
      isNaN(Number(rawFatherId))
    ) {
      errors.push({
        type: 'INVALID_DATA_TYPE',
        severity: 'error',
        row: rowNum,
        field: 'Father ID',
        message: `Baris ${rowNum}: ID Ayah "${rawFatherId}" bukan angka yang valid.`,
      });
    }

    // Validasi Nama
    const name = normalizeString(row['Nama']);
    if (!name) {
      errors.push({
        type: 'EMPTY_NAME',
        severity: 'error',
        row: rowNum,
        field: 'Nama',
        message: `Baris ${rowNum} (ID: ${rawId}): Kolom Nama kosong.`,
      });
    }

    const person: TaromboPerson = {
      id: String(rawId).trim(),
      fatherId: normalizeId(rawFatherId),
      name: name ?? `(Tanpa Nama #${rawId})`,
      gender: normalizeGender(row['Gender']),
      spouse: normalizeString(row['Pasangan']),
      generation: normalizeNumber(row['Generasi']),
      generationComputed: 0,
      marga: normalizeString(row['Marga']),
      birthYear: normalizeString(row['Lahir']),
      deathYear: normalizeString(row['Wafat']),
      notes: normalizeString(row['Catatan']),
      isRoot: false,
    };

    persons.push(person);
  });

  return { persons, errors };
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Gagal membaca file Excel.'));
    reader.readAsArrayBuffer(file);
  });
}
