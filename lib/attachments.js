// Files a visitor may attach to the contact form, shared by the form
// (validation, icons), the sender (lib/cms/contact.js) and the dashboard inbox.
// The Storage bucket and the contact_submissions CHECK repeat these limits
// (supabase/migrations/20261007000000_contact_attachments.sql), so they hold
// even if this check is bypassed.

export const ATTACHMENT_BUCKET = 'contact-attachments';
export const MAX_FILES = 3;
export const MAX_MB = 10;
export const MAX_BYTES = MAX_MB * 1024 * 1024;

// Extension → [MIME type, kind]. The type is taken from the extension because
// browsers often leave `File.type` empty for spreadsheets.
const TYPES = {
  jpg: ['image/jpeg', 'image'],
  jpeg: ['image/jpeg', 'image'],
  png: ['image/png', 'image'],
  webp: ['image/webp', 'image'],
  pdf: ['application/pdf', 'pdf'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'sheet'],
  xls: ['application/vnd.ms-excel', 'sheet'],
  csv: ['text/csv', 'sheet'],
};

/** For <input accept>: extensions and MIME types (some phones only match one of the two). */
export const ACCEPT = [...Object.keys(TYPES).map((ext) => `.${ext}`), ...new Set(Object.values(TYPES).map(([mime]) => mime))].join(',');

export const extOf = (name = '') => (name.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
/** 'image' | 'pdf' | 'sheet', or null when the file type is not accepted. */
export const kindOf = (name) => TYPES[extOf(name)]?.[1] ?? null;
export const mimeOf = (name) => TYPES[extOf(name)]?.[0] ?? null;

/** 820 KB · 1.4 MB */
export function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
