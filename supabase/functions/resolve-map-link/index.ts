// Google Maps share link (maps.app.goo.gl/… or goo.gl/maps/…) → the full Maps URL it redirects to.
//
// Called by the dashboard's map field (components/admin/fields/MapInput.js), which turns the result into an
// embeddable map. The browser can't follow these redirects itself: the short-link host sends no CORS headers.
// Only short-link hosts are ever requested. Deploy: supabase functions deploy resolve-map-link

const SHORT_LINK = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const { url: input } = await req.json().catch(() => ({}));
  let url = typeof input === 'string' ? input.trim() : '';
  try {
    for (let hop = 0; hop < 5 && SHORT_LINK.test(url); hop++) {
      const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
      await res.body?.cancel();
      const next = res.headers.get('location');
      if (!next) break;
      url = new URL(next, url).href;
    }
  } catch {
    // Unreachable or timed out: reported as unresolved below.
  }
  return Response.json({ url: url && !SHORT_LINK.test(url) ? url : null }, { headers: cors });
});
