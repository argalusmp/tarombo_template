import * as XLSX from 'xlsx';
import type { TaromboRawRow, TaromboPerson, ValidationError } from '@/types/tarombo';

// ============================================================
// Excel Parser — reads the "Tarombo" sheet from an XLSX workbook
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

  // Check sheet existence
  if (!workbook.SheetNames.includes(SHEET_NAME)) {
    errors.push({
      type: 'INVALID_DATA_TYPE',
      severity: 'error',
      message: `Sheet "${SHEET_NAME}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`,
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
      message: 'The Tarombo sheet is empty.',
    });
    return { persons: [], errors };
  }

  const persons: TaromboPerson[] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Excel row (1-indexed header + 1)

    // Validate ID
    const rawId = row['ID'];
    if (rawId === null || rawId === undefined || String(rawId).trim() === '') {
      errors.push({
        type: 'INVALID_DATA_TYPE',
        severity: 'error',
        row: rowNum,
        field: 'ID',
        message: `Row ${rowNum}: ID is missing or empty.`,
      });
      return; // skip this row
    }

    if (isNaN(Number(rawId))) {
      errors.push({
        type: 'INVALID_DATA_TYPE',
        severity: 'error',
        row: rowNum,
        field: 'ID',
        message: `Row ${rowNum}: ID "${rawId}" is not a valid number.`,
      });
      return;
    }

    // Validate Father ID (optional, but must be numeric if provided)
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
        message: `Row ${rowNum}: Father ID "${rawFatherId}" is not a valid number.`,
      });
    }

    // Validate Name
    const name = normalizeString(row['Nama']);
    if (!name) {
      errors.push({
        type: 'EMPTY_NAME',
        severity: 'error',
        row: rowNum,
        field: 'Nama',
        message: `Row ${rowNum} (ID: ${rawId}): Name (Nama) is empty.`,
      });
    }

    const person: TaromboPerson = {
      id: String(rawId).trim(),
      fatherId: normalizeId(rawFatherId),
      name: name ?? `(Unnamed #${rawId})`,
      gender: normalizeGender(row['Gender']),
      spouse: normalizeString(row['Pasangan']),
      generation: normalizeNumber(row['Generasi']),
      generationComputed: 0, // will be set during layout
      marga: normalizeString(row['Marga']),
      birthYear: normalizeString(row['Lahir']),
      deathYear: normalizeString(row['Wafat']),
      notes: normalizeString(row['Catatan']),
      isRoot: false, // will be computed
    };

    persons.push(person);
  });

  return { persons, errors };
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
