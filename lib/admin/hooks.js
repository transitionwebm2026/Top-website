'use client';

// Data hooks for the dashboard. Every call goes through the browser Supabase
// client with the admin's session, so Row Level Security is enforced on each
// read and write. After a successful write the public cache is purged
// (revalidateCms) so the live site shows the change on the next request.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MEDIA_BUCKET } from '@/lib/supabase/config';
import { isLocalized } from '@/lib/cms/schema';
import { revalidateCms } from '@/app/admin/actions';

/**
 * Classifies Postgres / PostgREST errors. The dashboard shows known kinds as a
 * translated message (`err.<kind>` in lib/admin/i18n.js) via useFeedback().fail.
 */
export function errorKind(error) {
  const code = error?.code;
  if (code === '23505') return 'unique';
  if (code === '23503') return 'fk';
  if (code === '23514') return 'check';
  if (code === '42501' || /row-level security/i.test(error?.message || '')) return 'perm';
  if (code === 'PGRST205') return 'table';
  return null;
}

/** Throws a Supabase error as an Error carrying `kind` (see errorKind). */
export function throwIf(error) {
  if (error) throw Object.assign(new Error(error.message || String(error)), { kind: errorKind(error), cause: error });
}

const unwrap = ({ data, error }) => {
  throwIf(error);
  return data;
};

/** Only the columns a field list edits (plus fixed extras) are ever sent to the database. */
export function toPayload(fields, row, extra = {}) {
  const out = { ...extra };
  for (const f of fields) {
    if (f.readOnly) continue;
    if (isLocalized(f)) {
      const empty = f.type === 'tags' ? [] : null;
      out[`${f.name}_ar`] = row[`${f.name}_ar`] ?? empty;
      out[`${f.name}_en`] = row[`${f.name}_en`] ?? empty;
    } else {
      let v = row[f.name];
      if (f.type === 'number') v = v === '' || v == null ? null : Number(v);
      if (typeof v === 'string' && !v.trim() && !f.keepEmpty) v = null;
      out[f.name] = v ?? (f.type === 'tags' || f.type === 'gallery' || f.type === 'repeater' ? [] : null);
    }
  }
  return out;
}

// -----------------------------------------------------------------------------
// useTable — list + CRUD for one table
// -----------------------------------------------------------------------------
/**
 * @param {string} table
 * @param {object} opts
 *   select  PostgREST select string
 *   order   [[column, ascending], …]
 *   eq      { column: value } filters
 */
export function useTable(table, { select = '*', order = [['sort_order', true]], eq = {} } = {}) {
  const supabase = createClient();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify({ table, select, order, eq });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from(table).select(select);
      Object.entries(eq).forEach(([k, v]) => (q = q.eq(k, v)));
      order.forEach(([col, asc]) => (q = q.order(col, { ascending: asc })));
      setRows(unwrap(await q) || []);
      setError('');
    } catch (e) {
      setError(e.kind ? `err.${e.kind}` : e.message);
    } finally {
      setLoading(false);
    }
    // `key` captures every option.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  /** Insert (no id) or update (with id). Returns the saved row. */
  const save = useCallback(
    async (id, values) => {
      const q = id ? supabase.from(table).update(values).eq('id', id) : supabase.from(table).insert(values);
      const saved = unwrap(await q.select().single());
      await revalidateCms();
      await load();
      return saved;
    },
    [supabase, table, load],
  );

  const remove = useCallback(
    async (id) => {
      unwrap(await supabase.from(table).delete().eq('id', id));
      await revalidateCms();
      await load();
    },
    [supabase, table, load],
  );

  /** Patch one column on one row without reloading the editor (toggles). */
  const patch = useCallback(
    async (id, values) => {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...values } : r)));
      try {
        unwrap(await supabase.from(table).update(values).eq('id', id));
        await revalidateCms();
      } catch (e) {
        await load();
        throw e;
      }
    },
    [supabase, table, load],
  );

  /** Persist a new order: `ids` in display order → sort_order 0..n. */
  const reorder = useCallback(
    async (ids) => {
      setRows((rs) => ids.map((id) => rs.find((r) => r.id === id)).filter(Boolean));
      const results = await Promise.all(ids.map((id, i) => supabase.from(table).update({ sort_order: i }).eq('id', id)));
      results.forEach(unwrap);
      await revalidateCms();
    },
    [supabase, table],
  );

  return { rows, loading, error, reload: load, save, remove, patch, reorder };
}

// -----------------------------------------------------------------------------
// useSingleton — one row by id (site_settings)
// -----------------------------------------------------------------------------
export function useSingleton(table, id = 1) {
  const supabase = createClient();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRow(unwrap(await supabase.from(table).select('*').eq('id', id).maybeSingle()));
      setError('');
    } catch (e) {
      setError(e.kind ? `err.${e.kind}` : e.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, table, id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (values) => {
      const saved = unwrap(await supabase.from(table).update(values).eq('id', id).select().single());
      setRow(saved);
      await revalidateCms();
      return saved;
    },
    [supabase, table, id],
  );

  return { row, loading, error, reload: load, save };
}

// -----------------------------------------------------------------------------
// usePageSections — a page with all its sections and bilingual content
// -----------------------------------------------------------------------------
const PAGE_SELECT = `
  id, slug, path, title_en, title_ar, meta_title_ar, meta_title_en, meta_description_ar, meta_description_en, og_image,
  sections ( id, key, type, label, sort_order, is_visible, section_content ( id, content_ar, content_en, updated_at ) )
`;

export function usePageSections(slug) {
  const supabase = createClient();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = unwrap(await supabase.from('pages').select(PAGE_SELECT).eq('slug', slug).maybeSingle());
      if (data) {
        data.sections = (data.sections || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((s) => ({ ...s, content: Array.isArray(s.section_content) ? s.section_content[0] : s.section_content }));
      }
      setPage(data);
      setError(data ? '' : 'err.pageMissing');
    } catch (e) {
      setError(e.kind ? `err.${e.kind}` : e.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, slug]);

  useEffect(() => {
    load();
  }, [load]);

  const sections = useMemo(() => Object.fromEntries((page?.sections || []).map((s) => [s.key, s])), [page]);

  const saveSection = useCallback(
    async (sectionId, { ar, en }) => {
      const { data: auth } = await supabase.auth.getUser();
      const saved = unwrap(
        await supabase
          .from('section_content')
          .upsert({ section_id: sectionId, content_ar: ar, content_en: en, updated_by: auth.user?.id }, { onConflict: 'section_id' })
          .select('id, content_ar, content_en, updated_at')
          .single(),
      );
      setPage((p) => ({ ...p, sections: p.sections.map((s) => (s.id === sectionId ? { ...s, content: saved } : s)) }));
      await revalidateCms();
      return saved;
    },
    [supabase],
  );

  const setVisible = useCallback(
    async (sectionId, isVisible) => {
      unwrap(await supabase.from('sections').update({ is_visible: isVisible }).eq('id', sectionId));
      setPage((p) => ({ ...p, sections: p.sections.map((s) => (s.id === sectionId ? { ...s, is_visible: isVisible } : s)) }));
      await revalidateCms();
    },
    [supabase],
  );

  const savePage = useCallback(
    async (values) => {
      const saved = unwrap(await supabase.from('pages').update(values).eq('id', page.id).select().single());
      setPage((p) => ({ ...p, ...saved }));
      await revalidateCms();
      return saved;
    },
    [supabase, page?.id],
  );

  return { page, sections, loading, error, reload: load, saveSection, setVisible, savePage };
}

// -----------------------------------------------------------------------------
// useUpload — files to the public "media" bucket
// -----------------------------------------------------------------------------
const MAX_BYTES = 20 * 1024 * 1024;
const slugifyName = (name) =>
  name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'file';

export function useUpload() {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  /** Uploads a File under `folder/` and returns its public URL. */
  const upload = useCallback(
    async (file, folder = 'uploads') => {
      if (file.size > MAX_BYTES) throw Object.assign(new Error('File is larger than 20 MB.'), { kind: 'size' });
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `${folder}/${Date.now()}-${slugifyName(file.name)}.${ext}`;
      setUploading(true);
      try {
        unwrap(await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type }));
        return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
      } finally {
        setUploading(false);
      }
    },
    [supabase],
  );

  return { upload, uploading };
}

// -----------------------------------------------------------------------------
// useCounts — dashboard overview numbers
// -----------------------------------------------------------------------------
export function useCounts(specs) {
  const supabase = createClient();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const specsRef = useRef(specs);

  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(
        Object.entries(specsRef.current).map(async ([name, { table, eq = {} }]) => {
          let q = supabase.from(table).select('id', { count: 'exact', head: true });
          Object.entries(eq).forEach(([k, v]) => (q = q.eq(k, v)));
          const { count } = await q;
          return [name, count ?? 0];
        }),
      );
      if (alive) {
        setCounts(Object.fromEntries(entries));
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [supabase]);

  return { counts, loading };
}
