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
 * Convert a base64 data URL to a Blob for upload.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

/**
 * Get the extension for a data URL's mime type.
 */
export function getExtensionFromDataUrl(dataUrl: string): string {
  const header = dataUrl.split(',')[0];
  if (header.includes('image/jpeg') || header.includes('image/jpg')) return 'jpg';
  if (header.includes('image/webp')) return 'webp';
  if (header.includes('image/svg')) return 'svg';
  return 'png';
}
