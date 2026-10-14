// Google Maps link → embeddable map URL.
//
// Google refuses to load ordinary Maps pages inside an <iframe>; only the
// `output=embed` / `/maps/embed` forms are allowed. Admins paste whatever they
// have (a share link from the phone, the browser address bar, the "Embed a map"
// <iframe> code, coordinates or a plain address) and it's converted here.

const ZOOM = 17;

const embed = (q) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${ZOOM}&output=embed`;

const isGoogleHost = (host) => /^((www|maps)\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/i.test(host);

/** `maps.app.goo.gl/…` / `goo.gl/maps/…` share links. They only say where they point after a redirect (resolveMapLink). */
export const isShortMapLink = (v) => /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(String(v ?? '').trim());

/**
 * Synchronous conversion. Returns the embed URL, '' for empty input, or null
 * when the input isn't a Google Maps location (short links included — resolve those first).
 */
export function toMapEmbed(input) {
  let v = String(input ?? '').trim();
  if (!v) return '';
  v = v.match(/src=["']([^"']+)["']/i)?.[1].replace(/&amp;/g, '&') ?? v;

  // Coordinates ("30.0586, 31.2446") or a typed address.
  if (!/^https?:\/\//i.test(v)) return /[<>]/.test(v) || v.length > 200 ? null : embed(v);

  let url;
  try {
    url = new URL(v);
  } catch {
    return null;
  }
  if (!isGoogleHost(url.hostname)) return null;
  url.protocol = 'https:';
  if (url.pathname.startsWith('/maps/embed') || url.searchParams.get('output') === 'embed') return url.href;
  if (!url.pathname.startsWith('/maps') && url.hostname.split('.')[0] !== 'maps') return null;

  const coords = (m) => m && `${m[1]},${m[2]}`;
  const name = url.pathname.match(/\/maps\/(?:place|search)\/([^/@]+)/)?.[1];
  const target =
    url.searchParams.get('q') ||
    url.searchParams.get('query') ||
    coords(v.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)) || // the pin of a place page
    (name && decodeURIComponent(name.replace(/\+/g, ' '))) ||
    coords(url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)) ||
    url.searchParams.get('ll');
  return target ? embed(target) : null;
}

/**
 * Build time only (Google's short-link host has no CORS; the dashboard uses the
 * `resolve-map-link` Edge Function): follows a share link's redirects to the
 * full Maps URL, then converts it. Only short-link hosts are ever requested.
 * No `cache: 'no-store'`: during a static build it marks the page dynamic and the fetch throws.
 */
export async function resolveMapLink(input) {
  let v = String(input ?? '').trim();
  for (let hop = 0; hop < 5 && isShortMapLink(v); hop++) {
    const res = await fetch(v, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
    const next = res.headers.get('location');
    if (!next) return null;
    v = new URL(next, v).href;
  }
  return isShortMapLink(v) ? null : toMapEmbed(v);
}
