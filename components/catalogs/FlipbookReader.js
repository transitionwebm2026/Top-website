'use client';

/* eslint-disable @next/next/no-img-element -- pages are blob: images drawn by pdf.js */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { AlertTriangle, BookOpen, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { openPdf, pageAspect, renderPage } from '@/lib/pdf';

const fill = (s = '', vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Pages are drawn at one of these widths (device pixels), so resizing the window
// doesn't redraw them all; the screen's pixel ratio is capped at 2 to save memory.
const STEPS = [240, 360, 480, 720, 960, 1280, 1600, 2000, 2400];
const step = (px) => STEPS.find((s) => s >= px) ?? STEPS.at(-1);
const ZOOMS = [1, 1.6, 2.4];
const THUMB_H = 64;
const EASE = [0.45, 0.05, 0.25, 1];
const hidden = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------
/** The PDF document, its first page's aspect ratio and the download progress. */
function usePdf(url) {
  const [state, setState] = useState({ doc: null, aspect: null, progress: null, failed: false });
  useEffect(() => {
    let alive = true;
    let task = null;
    openPdf(url, (progress) => alive && setState((s) => ({ ...s, progress })))
      .then(async (t) => {
        task = t;
        if (!alive) return t.destroy();
        const doc = await t.promise;
        const aspect = pageAspect(await doc.getPage(1));
        if (alive) setState({ doc, aspect, progress: 1, failed: false });
      })
      .catch((err) => {
        if (!alive) return;
        console.error('[catalog] could not open', url, err);
        setState((s) => ({ ...s, failed: true }));
      });
    return () => {
      alive = false;
      task?.destroy();
    };
  }, [url]);
  return state;
}

/**
 * Pages drawn to images, one at a time: the pages around the current view first
 * (`focus` replaces that list on every turn), then thumbnails as they scroll into view.
 */
function usePageImages(doc) {
  const [, setVersion] = useState(0);
  const [api, setApi] = useState(null);

  useEffect(() => {
    if (!doc) return undefined;
    const cache = new Map(); // page → Map(width → object URL)
    let main = [];
    const thumbs = [];
    let busy = false;
    let dead = false;
    const has = ({ page, width }) => cache.get(page)?.has(width);

    const pump = async () => {
      if (busy || dead) return;
      const job = main.shift() || thumbs.shift();
      if (!job) return;
      busy = true;
      try {
        if (!has(job)) {
          const blob = await renderPage(await doc.getPage(job.page), job.width);
          if (!dead) {
            if (!cache.has(job.page)) cache.set(job.page, new Map());
            cache.get(job.page).set(job.width, URL.createObjectURL(blob));
            setVersion((v) => v + 1);
          }
        }
      } catch (err) {
        if (!dead) console.warn(`[catalog] page ${job.page} could not be drawn`, err);
      } finally {
        busy = false;
        pump();
      }
    };

    setApi({
      /** The image drawn at `width`, else the closest wider one, else the widest so far. */
      src(page, width) {
        const sizes = cache.get(page);
        if (!sizes) return null;
        if (sizes.has(width)) return sizes.get(width);
        const widths = [...sizes.keys()].sort((a, b) => a - b);
        return sizes.get(widths.find((w) => w >= width) ?? widths.at(-1));
      },
      focus(jobs) {
        main = jobs.filter((j) => !has(j));
        pump();
      },
      thumb(job) {
        if (has(job) || thumbs.some((j) => j.page === job.page && j.width === job.width)) return;
        thumbs.push(job);
        pump();
      },
    });

    return () => {
      dead = true;
      cache.forEach((sizes) => sizes.forEach((url) => URL.revokeObjectURL(url)));
    };
  }, [doc]);

  return doc ? api : null;
}

function useSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

// -----------------------------------------------------------------------------
// Pages
// -----------------------------------------------------------------------------
/** A page lying flat in the book. `spine`: the side of the binding, shaded. */
function Sheet({ page, src, label, spine, style }) {
  if (!page) return null;
  return (
    <div className="absolute top-0 overflow-hidden bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]" style={style}>
      {src ? (
        <img key={page} src={src} alt={label} draggable={false} className="h-full w-full animate-fade-in object-fill" />
      ) : (
        <div className="h-full w-full animate-shimmer bg-[linear-gradient(100deg,#fff_30%,#efede7_50%,#fff_70%)] bg-[length:200%_100%]" />
      )}
      {spine && (
        <div
          className={`pointer-events-none absolute inset-y-0 w-[14%] from-black/25 via-black/5 to-transparent ${
            spine === 'right' ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'
          }`}
        />
      )}
    </div>
  );
}

/** One side of the turning leaf, darkened while it stands up. */
function Face({ src, shade, back }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white" style={back ? { ...hidden, transform: 'rotateY(180deg)' } : hidden}>
      {src && <img src={src} alt="" draggable={false} className="h-full w-full object-fill" />}
      <motion.div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-black/30" style={{ opacity: shade }} />
    </div>
  );
}

/**
 * The page being turned. Two pages side by side: the right page turns over the
 * spine onto the left (and back). One page: it lifts away to reveal the next,
 * or the previous one comes down over it.
 */
function Leaf({ flip, spread, pageW, pageH, front, back, onDone }) {
  const forward = flip.dir > 0;
  const from = spread || forward ? 0 : -90;
  const to = spread ? (forward ? -180 : 180) : forward ? -90 : 0;
  const rotate = useMotionValue(from);
  const shade = useTransform(rotate, (r) => Math.abs(Math.sin((r * Math.PI) / 180)));

  useEffect(() => {
    const controls = animate(rotate, to, { duration: spread ? 0.8 : 0.5, ease: EASE, onComplete: onDone });
    return () => controls.stop();
    // One turn per leaf: a new turn mounts a new leaf.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="absolute top-0 z-20 [transform-style:preserve-3d]"
      style={{
        left: spread && forward ? pageW : 0,
        width: pageW,
        height: pageH,
        rotateY: rotate,
        transformOrigin: spread && !forward ? 'right center' : 'left center',
      }}
    >
      <Face src={front} shade={shade} />
      {spread && <Face src={back} shade={shade} back />}
    </motion.div>
  );
}

function Thumb({ page, aspect, width, images, active, label, onPick, rootRef }) {
  const ref = useRef(null);
  const src = images?.src(page, width);

  useEffect(() => {
    if (src || !images) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && images.thumb({ page, width }),
      { root: rootRef.current, rootMargin: '0px 200px' },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [src, images, page, width, rootRef]);

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [active]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onPick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`relative shrink-0 overflow-hidden rounded-md bg-white transition ${
        active ? 'opacity-100 ring-2 ring-gold ring-offset-2 ring-offset-emerald-ink' : 'opacity-45 hover:opacity-90'
      }`}
      style={{ width: Math.round(THUMB_H * aspect), height: THUMB_H }}
    >
      {src && <img src={src} alt="" draggable={false} className="h-full w-full object-fill" />}
      <span className="absolute inset-x-0 bottom-0 bg-emerald-ink/70 font-[family-name:var(--font-montserrat)] text-[10px] leading-4 font-bold text-white">
        {page}
      </span>
    </button>
  );
}

function ToolButton({ label, onClick, disabled, children, href }) {
  const cls =
    'glass grid h-10 w-10 shrink-0 place-items-center rounded-full text-gold-light transition hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-35';
  if (href) {
    return (
      <a href={href} download target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={cls}>
      {children}
    </button>
  );
}

// -----------------------------------------------------------------------------
// Viewer
// -----------------------------------------------------------------------------
/**
 * Full-screen flipbook for one catalog (lazy-loaded by CatalogLibrary).
 * Portrait PDFs open as a book with two pages side by side on wide screens;
 * landscape PDFs (already two-page spreads) and phones show one page at a time.
 * Turn pages with the arrows, the keyboard, a swipe, a tap on either side of the
 * book or the page strip; zoom and full screen from the toolbar.
 */
export default function FlipbookReader({ catalog, onClose }) {
  const { t, pick, dir } = useLang();
  const tc = t.catalog;
  const reduceMotion = useReducedMotion();
  const { doc, aspect, progress, failed } = usePdf(catalog.file);
  const images = usePageImages(doc);

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const bookRef = useRef(null);
  const stripRef = useRef(null);
  const stage = useSize(stageRef);

  const [page, setPage] = useState(1);
  const [flip, setFlip] = useState(null); // { from, to, dir, id } — view indexes
  const [zoom, setZoom] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [dpr, setDpr] = useState(1);

  const numPages = doc?.numPages ?? 0;
  const ratio = aspect || 0.75;
  const spread = !!aspect && aspect < 1 && stage.width >= 720 && numPages > 1;

  // A view is what is open at once: [page] or [left, right] with the cover alone on the right.
  const views = useMemo(() => {
    if (!numPages) return [];
    if (!spread) return Array.from({ length: numPages }, (_, i) => [i + 1]);
    const list = [[null, 1]];
    for (let p = 2; p <= numPages; p += 2) list.push([p, p + 1 <= numPages ? p + 1 : null]);
    return list;
  }, [numPages, spread]);
  const current = Math.max(0, views.findIndex((v) => v.includes(page)));
  const view = views[current] || [];

  // Page size: as large as the stage allows (minus room for the side arrows), times the zoom.
  const sideRoom = stage.width >= 640 ? 136 : 16;
  const cols = spread ? 2 : 1;
  let pageH = Math.max(0, stage.height - 32);
  let pageW = pageH * ratio;
  if (pageW * cols > stage.width - sideRoom) {
    pageW = Math.max(0, (stage.width - sideRoom) / cols);
    pageH = pageW / ratio;
  }
  pageW = Math.floor(pageW * ZOOMS[zoom]);
  pageH = Math.floor(pageH * ZOOMS[zoom]);
  const renderW = step(pageW * dpr);
  const thumbW = step(THUMB_H * ratio * dpr);

  // ---- navigation ----------------------------------------------------------
  const live = useRef({});
  live.current = { views, current, zoom };

  const go = useCallback(
    (target) => {
      const { views: list, current: from, zoom: z } = live.current;
      if (!list.length) return;
      const to = clamp(target, 0, list.length - 1);
      if (to === from) return;
      setPage(list[to].find(Boolean));
      // A turn already running is replaced by this one.
      setFlip(reduceMotion || z > 0 ? null : { from, to, dir: Math.sign(to - from), id: Math.random() });
    },
    [reduceMotion],
  );
  const next = useCallback(() => go(live.current.current + 1), [go]);
  const prev = useCallback(() => go(live.current.current - 1), [go]);
  const endFlip = useCallback((id) => setFlip((f) => (f && f.id === id ? null : f)), []);
  // Switching between one and two pages (resizing, rotating a tablet) renumbers the views.
  useEffect(() => setFlip(null), [spread]);

  // Draw the open pages first, then the next and previous views.
  useEffect(() => {
    if (!images || !views.length) return;
    const order = [current, current + 1, current - 1, current + 2, current - 2].filter((i) => i >= 0 && i < views.length);
    images.focus(order.flatMap((i) => views[i]).filter(Boolean).map((p) => ({ page: p, width: renderW })));
  }, [images, views, current, renderW]);

  // ---- window: scroll lock, keys, focus, full screen ------------------------
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio || 1, 2));
    setCanFullscreen(!!document.fullscreenEnabled && !!rootRef.current?.requestFullscreen);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    rootRef.current?.focus();
    const onFullscreen = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('fullscreenchange', onFullscreen);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const keys = {
        Escape: () => (live.current.zoom > 0 ? setZoom(0) : onClose()),
        ArrowRight: next,
        PageDown: next,
        ArrowLeft: prev,
        PageUp: prev,
        Home: () => go(0),
        End: () => go(Infinity),
        '+': () => setZoom((z) => Math.min(z + 1, ZOOMS.length - 1)),
        '=': () => setZoom((z) => Math.min(z + 1, ZOOMS.length - 1)),
        '-': () => setZoom((z) => Math.max(z - 1, 0)),
      };
      if (!keys[e.key]) return;
      e.preventDefault();
      keys[e.key]();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, next, prev, onClose]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else rootRef.current?.requestFullscreen().catch(() => {});
  };

  // Zooming keeps the middle of the page in view.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [zoom]);

  // ---- pointer: swipe or tap to turn; drag to pan when zoomed --------------
  const gesture = useRef(null);
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const el = stageRef.current;
    gesture.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
    if (zoom > 0 && e.pointerType === 'mouse') el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
    if (zoom > 0 && e.pointerType === 'mouse') {
      stageRef.current.scrollLeft = g.left - dx;
      stageRef.current.scrollTop = g.top - dy;
    }
  };
  const onPointerUp = (e) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || zoom > 0) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    } else if (!g.moved && bookRef.current) {
      const r = bookRef.current.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        if (e.clientX > r.left + r.width / 2) next();
        else prev();
      }
    }
  };

  // ---- what is on the table ------------------------------------------------
  const src = (p) => (p ? images?.src(p, renderW) : null);
  const pageLabel = (p) => fill(tc.page, { page: p });
  let left = null;
  let right = null;
  let single = null;
  let front = null;
  let back = null;
  if (flip) {
    const from = views[flip.from] || [];
    const to = views[flip.to] || [];
    const forward = flip.dir > 0;
    if (spread) {
      left = forward ? from[0] : to[0];
      right = forward ? to[1] : from[1];
      front = forward ? from[1] : from[0];
      back = forward ? to[0] : to[1];
    } else {
      single = forward ? to[0] : from[0];
      front = forward ? from[0] : to[0];
    }
  } else if (spread) {
    [left, right] = view;
  } else {
    [single] = view;
  }
  // A closed book (front or back cover alone) is centred on its one page.
  const shift = spread && !zoom ? (view[0] == null ? -pageW / 2 : view[1] == null ? pageW / 2 : 0) : 0;

  const shown = view.filter(Boolean);
  const position = shown.length ? `${shown.join('–')} / ${numPages}` : '';
  const ready = doc && pageW > 0;

  return createPortal(
    <motion.div
      ref={rootRef}
      dir={dir}
      role="dialog"
      aria-modal="true"
      aria-label={pick(catalog.title)}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col bg-emerald-ink/95 outline-none backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_45%,rgba(33,87,51,0.45),transparent_70%)]" />

      {/* Toolbar */}
      <header className="relative z-10 flex items-center gap-2 border-b border-gold/15 px-3 py-2.5 sm:gap-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-extrabold sm:text-base">{pick(catalog.title)}</h2>
          <p className="truncate text-xs text-white/50">{[catalog.brand, pick(catalog.category)].filter(Boolean).join(' · ')}</p>
        </div>
        {position && (
          <span dir="ltr" className="hidden rounded-full bg-white/[0.06] px-3 py-1.5 font-[family-name:var(--font-montserrat)] text-xs font-bold text-gold-light sm:block">
            {position}
          </span>
        )}
        <span className="sr-only" aria-live="polite">
          {shown.length ? fill(tc.pageOf, { page: shown.join('–'), total: numPages }) : ''}
        </span>
        {ready && (
          <>
            <ToolButton label={tc.zoomOut} onClick={() => setZoom((z) => Math.max(z - 1, 0))} disabled={zoom === 0}>
              <ZoomOut size={18} />
            </ToolButton>
            <ToolButton label={tc.zoomIn} onClick={() => setZoom((z) => Math.min(z + 1, ZOOMS.length - 1))} disabled={zoom === ZOOMS.length - 1}>
              <ZoomIn size={18} />
            </ToolButton>
            {canFullscreen && (
              <ToolButton label={fullscreen ? tc.exitFullscreen : tc.fullscreen} onClick={toggleFullscreen}>
                {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </ToolButton>
            )}
          </>
        )}
        <ToolButton label={tc.download} href={catalog.file}>
          <Download size={18} />
        </ToolButton>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          title={t.common.close}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold-dark text-emerald-ink transition hover:rotate-90"
        >
          <X size={20} />
        </button>
      </header>

      {/* Book */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={stageRef}
          dir="ltr"
          className={`no-scrollbar absolute inset-0 select-none ${zoom ? 'cursor-grab overflow-auto active:cursor-grabbing' : 'overflow-hidden'}`}
          style={{ touchAction: zoom ? 'pan-x pan-y pinch-zoom' : 'pan-y pinch-zoom' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (gesture.current = null)}
        >
          {ready && (
            <div className="flex min-h-full w-max min-w-full items-center justify-center p-4">
              <motion.div
                ref={bookRef}
                className="relative shrink-0 [perspective:2600px]"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1, x: shift }}
                transition={{ x: { duration: reduceMotion ? 0 : 0.8, ease: EASE }, default: { duration: 0.5 } }}
                style={{ width: cols * pageW, height: pageH }}
              >
                {spread ? (
                  <>
                    <Sheet page={left} src={src(left)} label={pageLabel(left)} spine="right" style={{ left: 0, width: pageW, height: pageH }} />
                    <Sheet page={right} src={src(right)} label={pageLabel(right)} spine="left" style={{ left: pageW, width: pageW, height: pageH }} />
                  </>
                ) : (
                  <Sheet page={single} src={src(single)} label={pageLabel(single)} style={{ left: 0, width: pageW, height: pageH }} />
                )}
                {flip && (
                  <Leaf
                    key={flip.id}
                    flip={flip}
                    spread={spread}
                    pageW={pageW}
                    pageH={pageH}
                    front={src(front)}
                    back={src(back)}
                    onDone={() => endFlip(flip.id)}
                  />
                )}
              </motion.div>
            </div>
          )}
        </div>

        {/* Opening / failed */}
        {!doc && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center">
            {failed ? (
              <>
                <AlertTriangle size={44} strokeWidth={1.4} className="text-gold" />
                <p className="max-w-sm leading-relaxed text-white/75">{tc.error}</p>
                <a
                  href={catalog.file}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-light to-gold-dark px-6 py-3 text-sm font-bold text-emerald-ink transition hover:scale-105"
                >
                  <Download size={17} /> {tc.download}
                </a>
              </>
            ) : (
              <>
                <div className="relative grid h-[min(46vh,22rem)] aspect-[17/24] place-items-center overflow-hidden rounded-md bg-emerald-deep shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                  {catalog.cover ? (
                    <img src={catalog.cover} alt="" className="h-full w-full animate-pulse object-cover [animation-duration:2.4s]" />
                  ) : (
                    <BookOpen size={56} strokeWidth={1.2} className="text-gold" />
                  )}
                </div>
                <div className="w-56">
                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold transition-[width] duration-300 ${progress == null ? 'w-1/3 animate-pulse' : ''}`}
                      style={progress == null ? undefined : { width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/60">
                    {tc.loading}
                    {progress != null && (
                      <span dir="ltr" className="ms-1 font-[family-name:var(--font-montserrat)] text-gold-light">
                        {Math.round(progress * 100)}%
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Side arrows (the book reads left to right) */}
        {ready && views.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              disabled={current === 0}
              aria-label={t.common.prev}
              className="glass absolute top-1/2 left-2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-gold transition hover:scale-110 hover:bg-gold hover:text-emerald-ink disabled:pointer-events-none disabled:opacity-0 sm:left-5 sm:h-14 sm:w-14"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={current === views.length - 1}
              aria-label={t.common.next}
              className="glass absolute top-1/2 right-2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-gold transition hover:scale-110 hover:bg-gold hover:text-emerald-ink disabled:pointer-events-none disabled:opacity-0 sm:right-5 sm:h-14 sm:w-14"
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}

        {ready && tc.hint && (
          <motion.p
            className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-emerald-ink/80 px-4 py-2 text-xs whitespace-nowrap text-white/80 ring-1 ring-gold/20 backdrop-blur"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, 0] }}
            transition={{ duration: 4.5, times: [0, 0.1, 0.85, 1], delay: 0.6 }}
          >
            {tc.hint}
          </motion.p>
        )}
      </div>

      {/* Page strip */}
      {ready && numPages > 1 && (
        <div ref={stripRef} dir="ltr" className="no-scrollbar relative z-10 hidden gap-2 overflow-x-auto border-t border-gold/15 px-4 py-3 [@media(min-height:520px)]:flex">
          <div className="mx-auto flex gap-2">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
              <Thumb
                key={p}
                page={p}
                aspect={ratio}
                width={thumbW}
                images={images}
                active={view.includes(p)}
                label={pageLabel(p)}
                onPick={() => go(views.findIndex((v) => v.includes(p)))}
                rootRef={stripRef}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>,
    document.body,
  );
}
