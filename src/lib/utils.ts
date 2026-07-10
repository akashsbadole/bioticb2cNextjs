import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * CSV parsing and escaping utilities
 * Extracted from duplicated code across import/export routes
 */

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current.trim());
        current = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        row.push(current.trim());
        current = '';
        if (row.length > 0 && row.some(cell => cell !== '')) {
          rows.push(row);
        }
        row = [];
        if (ch === '\r') i++;
      } else {
        current += ch;
      }
    }
  }

  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some(cell => cell !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

export function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsvRow(row: unknown[]): string {
  return row.map(escapeCSV).join(',') + '\n';
}

/**
 * Get the first image URL from a JSON array string
 */
export function getFirstImage(images: string): string | null {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
  } catch {
    return null;
  }
}

/**
 * Generate a random password
 */
export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Robustly parse block JSON data, handling double-stringification or unexpected formats.
 */
export function parseBlocks(blocksData: unknown): any[] {
  if (!blocksData) return [];

  let parsed = blocksData;

  // Keep parsing if it's a string, to handle potential double-stringification
  while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
    try {
      const next = JSON.parse(parsed);
      // If parsing doesn't change anything or returns something not related to blocks, break
      if (next === parsed) break;
      parsed = next;
    } catch {
      break;
    }
  }

  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Validate and sanitize a file path to prevent path traversal
 */
export function sanitizeFilePath(filePath: string, baseDir: string): string | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  const fullPath = path.join(baseDir, filePath);
  const resolvedPath = path.resolve(fullPath);
  const resolvedBase = path.resolve(baseDir);
  
  if (!resolvedPath.startsWith(resolvedBase)) {
    return null; // Path traversal attempt
  }
  
  return resolvedPath;
}

/**
 * Check if a value is a valid URL
 */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/^https?:\/\/localhost:\d+/, "");
}

/**
 * Converts a standard Google Maps web URL or search URL into an embeddable iframe source URL.
 * If the URL is already an embed URL, it returns it unchanged.
 */
export function getGoogleMapsEmbedUrl(url: string | null | undefined): string {
  if (!url) return "";

  const trimmed = url.trim();

  // If already an embed URL or output=embed is set, return as-is
  if (
    trimmed.includes("/maps/embed") ||
    trimmed.includes("output=embed")
  ) {
    return trimmed;
  }

  // Handle standard google maps links
  try {
    const parsedUrl = new URL(trimmed);

    // Ensure it's a Google domain and contains maps or has maps.google.com
    const isGoogle =
      parsedUrl.hostname.includes("google.com") ||
      parsedUrl.hostname.includes("google.co.in") ||
      parsedUrl.hostname === "maps.google.com";

    if (!isGoogle) {
      return trimmed;
    }

    // 1. Try to extract place name from path: /maps/place/Place+Name/...
    const placeMatch = parsedUrl.pathname.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch && placeMatch[1] && !placeMatch[1].startsWith("@")) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    // 2. Try to extract coordinates from pathname: e.g. @18.6178949,73.7599339
    const coordMatch = parsedUrl.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch && coordMatch[1] && coordMatch[2]) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    // 3. Try to extract search query query parameters: q or query
    const q = parsedUrl.searchParams.get("q") || parsedUrl.searchParams.get("query");
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  } catch {
    // Fallback regex matching in case the URL constructor fails (e.g. invalid scheme or format)
    const placeMatch = trimmed.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch && placeMatch[1] && !placeMatch[1].startsWith("@")) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    const coordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch && coordMatch[1] && coordMatch[2]) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  return trimmed;
}

