import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Set them in your .env file (local) and Vercel Environment Variables (production).'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-application-name': 'eswatini-marshals',
    },
  },
});

export const STORAGE_BUCKETS = {
  photos: 'marshal-photos',
  signatures: 'marshal-signatures',
} as const;

export const TABLES = {
  marshals: 'marshals',
  syncLogs: 'sync_logs',
} as const;

/**
 * Convert a data URL to a Blob, correctly handling:
 *   - base64 data URLs:      data:image/png;base64,iVBOR...
 *   - UTF-8 SVG data URLs:   data:image/svg+xml;utf8,<svg...>
 *   - raw URL-encoded:       data:image/svg+xml,%3Csvg...%3E
 *   - plain text:            data:image/svg+xml,<svg...>
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('dataUrlToBlob: empty or invalid data URL');
  }
  if (!dataUrl.startsWith('data:')) {
    throw new Error(`dataUrlToBlob: not a valid data URL (got "${dataUrl.slice(0, 30)}...")`);
  }

  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('dataUrlToBlob: malformed data URL (missing comma separator)');
  }

  const header = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);

  const mimeMatch = header.match(/^data:([^;,]+)/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

  const isBase64 = header.includes(';base64');

  if (isBase64) {
    // Standard base64 decode
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  // Otherwise: URL-encoded UTF-8 (SVG case) or plain text
  // decodeURIComponent may throw on malformed input, so we fall back to the raw payload.
  let decoded: string;
  try {
    decoded = decodeURIComponent(payload);
  } catch {
    decoded = payload;
  }

  return new Blob([decoded], { type: mime });
}

/**
 * Get a file extension for a data URL. Prefers a matching ext from the mime type.
 */
export function getExtensionFromDataUrl(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  const header = commaIndex === -1 ? dataUrl : dataUrl.slice(0, commaIndex);

  if (header.includes('image/jpeg') || header.includes('image/jpg')) return 'jpg';
  if (header.includes('image/png')) return 'png';
  if (header.includes('image/webp')) return 'webp';
  if (header.includes('image/svg')) return 'svg';
  if (header.includes('image/gif')) return 'gif';
  if (header.includes('image/heic')) return 'heic';
  return 'bin';
}
