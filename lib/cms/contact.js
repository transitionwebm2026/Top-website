import { createPublicClient } from '@/lib/supabase/public';
import { SUPABASE_KEY, SUPABASE_URL, assertConfigured } from '@/lib/supabase/config';
import { ATTACHMENT_BUCKET, MAX_BYTES, MAX_FILES, extOf, kindOf, mimeOf } from '@/lib/attachments';

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const uuid = () =>
  crypto.randomUUID?.() ??
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));

/** Storage-safe object name; the original name is kept in the message row. */
function storageName(name, i) {
  const ext = extOf(name);
  const base = name
    .slice(0, -(ext.length + 1))
    .normalize('NFKD')
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${i + 1}-${base || 'file'}.${ext}`;
}

/**
 * One file → the private attachments bucket, reporting upload progress (0..1).
 * Same request as supabase-js `storage.upload`, sent with XMLHttpRequest
 * because fetch cannot report upload progress.
 */
function uploadFile(path, file, onProgress) {
  assertConfigured();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${ATTACHMENT_BUCKET}/${path}`);
    xhr.setRequestHeader('apikey', SUPABASE_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_KEY}`);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`upload failed (${xhr.status}): ${xhr.responseText.slice(0, 200)}`)));
    xhr.onerror = () => reject(new Error('upload failed (network)'));
    const body = new FormData();
    body.append('cacheControl', '3600');
    // Typed from the extension: the bucket only accepts the listed MIME types.
    body.append('', file.slice(0, file.size, mimeOf(file.name)), path.split('/').pop());
    xhr.send(body);
  });
}

/**
 * Contact form → `contact_submissions`, straight from the browser. RLS only
 * lets visitors insert new messages (never read them back), CHECK constraints
 * re-validate every field, and only admins can read them (Dashboard → Contact & Enquiries).
 *
 * `files` (optional, lib/attachments.js limits) are uploaded first to the
 * private `contact-attachments` bucket, where visitors may upload but never
 * read; `onProgress(index, 0..1)` follows each upload.
 * Throws when the message is invalid or could not be saved.
 */
export async function sendContactMessage(data, files = [], onProgress = () => {}) {
  // Honeypot filled → a bot. Pretend success so it does not retry.
  if (typeof data.website === 'string' && data.website.trim()) return;

  const msg = {
    name: clean(data.name, 120),
    email: clean(data.email, 200),
    phone: clean(data.phone, 40),
    subject: clean(data.subject, 200) || null,
    message: clean(data.message, 5000),
    lang: data.lang === 'en' ? 'en' : 'ar',
  };
  if (!msg.name || !msg.phone || !msg.message || !/^\S+@\S+\.\S+$/.test(msg.email)) {
    throw new Error('Missing or invalid fields');
  }
  if (files.length > MAX_FILES || files.some((f) => !kindOf(f.name) || !f.size || f.size > MAX_BYTES)) {
    throw new Error('Invalid attachments');
  }

  // Only sent with files, so the form keeps working where the attachments migration is not applied yet.
  if (files.length) {
    const folder = `inbox/${uuid()}`;
    msg.attachments = await Promise.all(
      files.map(async (file, i) => {
        const path = `${folder}/${storageName(file.name, i)}`;
        await uploadFile(path, file, (p) => onProgress(i, p));
        onProgress(i, 1);
        return { path, name: file.name.slice(0, 200), type: mimeOf(file.name), size: file.size };
      }),
    );
  }

  // No `.select()`: anonymous users may insert but not read submissions back.
  const { error } = await createPublicClient().from('contact_submissions').insert(msg);
  if (error) {
    console.error('[contact] insert failed:', error.code, error.message);
    throw new Error('Could not save your message');
  }
}
