# TOP POWER – MEP Engineering Supplies

Bilingual (Arabic RTL default / English LTR) website with a Supabase-backed headless CMS and admin dashboard.
Built with Next.js 15 (App Router), Supabase (Postgres, Auth, Storage), Tailwind CSS v4 and Framer Motion.
Deployed as a **static site** (`output: 'export'`): plain HTML/CSS/JS on any web host, no Node.js server.

All text, media, products, articles and settings live in Supabase — nothing is hard-coded in the frontend.

## Run

```bash
npm install
cp .env.example .env.local   # fill in the Supabase URL + publishable key
npm run dev                  # http://localhost:3000  ·  dashboard: /admin
```

## Build & deploy (Hostinger or any static host)

```bash
npm run build                # reads all content from Supabase, writes the static site to out/
npm start                    # = npx serve out → preview the real build at http://localhost:3000
```

Upload the **contents** of `out/` to `public_html` (it includes `.htaccess` from `public/`: HTTPS, `/about` →
`/about/`, real 404 page, caching headers). Every route is a folder with an `index.html`, so reloads and shared
links never 404.

**When to rebuild.** Text, images, products, articles and settings edited in the dashboard show on the live site
without a rebuild (see *How content flows*). Rebuild and re-upload after:
- adding or renaming a **product category** (each one is its own page);
- changing **SEO metadata** (titles, descriptions, share images, favicon) — search engines and link previews read
  the static HTML;
- code changes.

**Public site URL.** Set it in *Global Settings → SEO* (or `NEXT_PUBLIC_SITE_URL` in `.env.local`) before building:
link previews need absolute image URLs, and a static page has no request host to take them from.

## Supabase setup (once per project)

1. **Schema** — run the files in `supabase/migrations/` in order in the Supabase SQL Editor (or `supabase db push`).
   `…_cms_schema.sql` creates the tables, RLS policies, helper functions and the public `media` bucket;
   `…_contact_attachments.sql` adds contact-form attachments (private `contact-attachments` bucket);
   `…_catalogs.sql` adds the `/catalog` page and its `catalogs` table, and puts a *Catalog* link after
   *Products* in the navbar and footer; `…_articles.sql` adds five product articles (seamless pipes, Sch 40 vs
   Sch 80, malleable iron fittings, MECH valves, fire sprinklers) to the blog; `…_mech_catalogs_certificates.sql`
   adds the MECH seamless pipe, malleable fittings and fire valve catalogs and the UL/FM check valve certificates;
   `…_experience_ring.sql` gives the home page's rotating ring around the 15+ badge its Arabic and English text.
   Each file is safe to re-run.
2. **Default content** — run `supabase/seed.sql`. Idempotent: re-running never overwrites dashboard edits.
3. **First admin** — create the user in *Authentication → Users → Add user* (auto-confirm), then:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
4. **Recommended** — turn off *Allow new users to sign up* (Authentication → Sign In / Providers).
   New sign-ups get the `viewer` role and cannot edit anything, but there is no reason to allow them.
5. **Map share links** — deploy the Edge Function that resolves `maps.app.goo.gl/…` links pasted in the dashboard
   (the browser can't follow them itself): `supabase functions deploy resolve-map-link`. Without it, paste the full
   Google Maps link instead; share links already saved are resolved at build time.

## Admin dashboard (`/admin`)

| Section | Manages |
|---|---|
| Dashboard Overview | Content counts, latest enquiries, quick actions |
| Home Page | Hero, about summary, bento grid categories, partner logos, key projects, pre-footer CTA |
| About Us | Hero, history timeline, mission & goals, certification badges, legal documents (image + PDF) |
| Market / Products | Category CRUD, product items (brands, shapes, sizes, datasheets, gallery), catalog hero |
| Catalogs | PDF catalogs for `/catalog` (cover, page count and size read from the PDF on save), page hero & CTA |
| Blogs | Markdown articles in AR/EN with tables (`<br>` for a line break inside a cell), hero vs grid placement, drafts & scheduled dates |
| Contact & Enquiries | Contact-form inbox (status, notes, reply), phones/email/address/map, contact page copy |
| Global Settings | Navbar & footer links, WhatsApp/call buttons, social links, logos & theme colours, SEO, UI translations |

Every page editor also has an **SEO** tab (per-page title, description and share image).

**Security.** The dashboard pages are static files; `components/admin/AdminGuard.js` sends visitors without a valid
session to `/admin/login` and shows *access denied* unless `profiles.role = 'admin'`. What protects the content is
RLS, which enforces the same rule on every query and upload. Visitors can only read published rows and insert
contact messages.

## How content flows

```
                   ┌─► npm run build: lib/cms/queries.js ──► static HTML (fast first paint, SEO)
Supabase tables ───┤        (both use lib/cms/content.js + mappers.js; both languages as { ar, en })
         ▲         └─► browser, on page load: lib/cms/live.js ──► same components, latest content
         └── dashboard (lib/admin/hooks.js, browser client + RLS) ── save
```

- Both languages are loaded together, so the language toggle is instant; `pick(value)` selects the current one.
- Page sections store `content_ar` / `content_en` JSON documents. Their fields are defined once in
  `lib/cms/schema.js`, which drives both the dashboard forms and the renderers.
- Static UI text (buttons, labels, messages) comes from the `translations` table (`t.cta.contact`, …).
- Pages are built with the content at build time, then fetch it again from Supabase once loaded, so dashboard
  saves (and blog posts reaching their scheduled date) show on the next visit. If Supabase is unreachable the
  built content stays. The refresh runs when the browser is idle, downloads the Supabase client only then, and
  its results are shared by all pages for a minute, so moving between pages doesn't query again.
- The contact form inserts into `contact_submissions` directly from the browser (`lib/cms/contact.js`). Visitors can
  attach up to 3 images, PDFs or Excel/CSV sheets (10 MB each, `lib/attachments.js`). They go to the private
  `contact-attachments` bucket: visitors can upload but never read, and admins open them from the inbox through
  signed links. Deleting a message deletes its files too. The attachment field appears once its
  `contact.attach*` texts exist, i.e. once the attachments migration has run.
- Uploads go to the public `media` bucket.

## Images & performance

`<Image>` goes through `lib/image-loader.js`, which serves every image at the width the screen needs, as WebP:
- **Dashboard uploads** (Supabase Storage) — resized by Supabase *Image Transformations*
  (`/storage/v1/render/image/…`). It's a Pro-plan feature, billed per distinct source image beyond the plan quota.
- **Files in `public/images`** — `npm run images` (run automatically before `dev` and `build`) writes WebP copies
  in several widths to `public/_img` (git-ignored) and lists them in `lib/image-manifest.json`. Add new files
  there, then run it (or just build).

Other choices that keep navigation fast, especially on phones: page and hero entrances are CSS animations (they
start with the first paint instead of waiting for JavaScript); looping hero effects only move transforms and are
switched off on small screens; the menu's pages are prefetched once the first page is idle; heavy pieces load on
demand (Markdown renderer, contact-form sender, Google Map, the catalog viewer and pdf.js).

## Structure

```
app/(site)/            public routes: / , /about, /products, /products/[id], /catalog, /blog, /contact
app/admin/             /admin/login and the dashboard ((dashboard)/…, guarded by components/admin/AdminGuard.js)
lib/supabase/          browser (admin session) and public (anonymous) clients
lib/cms/               content loaders, build-time queries, live refresh, mappers, section schemas
public/.htaccess       Apache/LiteSpeed rules shipped with the build (HTTPS, trailing slash, 404, caching)
supabase/functions/    resolve-map-link Edge Function (dashboard map field)
lib/admin/             dashboard hooks (CRUD, uploads) and table field schemas
components/admin/      dashboard shell, form fields, section/collection editors
components/…           public site sections
supabase/migrations/   schema + RLS
supabase/seed.sql      default content, generated by scripts/generate-seed.mjs from supabase/seed-data/
```

## Products

Four categories (`/products/pipes/`, `/fittings/`, `/valves/`, `/sprinklers/`), each with product
items shown as tabs. Deep-link a tab with a hash: `/products/fittings/#grooved`. Items without a photo show a
line-art icon until an image is uploaded.

## Catalogs

`/catalog` shows the PDF catalogs as 3D books. *Browse* opens a full-screen flipbook
(`components/catalogs/FlipbookReader.js`): portrait PDFs open as a book with two pages side by side on wide
screens, landscape PDFs (already two-page spreads) and phones show one page at a time. Pages turn with the arrows,
the keyboard, a swipe, a tap on either side or the page strip; zoom and full screen are in the toolbar. Open a
catalog directly with its link name: `/catalog/#mech-fire-sprinklers`.

Pages are drawn in the browser by pdf.js (`lib/pdf.js`), which loads only when a catalog is hovered or opened.
`npm run pdfjs` (run automatically before `dev` and `build`) copies it from `node_modules/pdfjs-dist` to
`public/pdfjs/<version>/` (git-ignored), with the fonts and decoders some PDFs need. The first catalogs ship in
`public/catalogs/`; new ones uploaded in the dashboard go to the `media` bucket (20 MB per file).

## Language

The language is stored in the `tp-lang` cookie. Pages are built in Arabic; for English visitors a small inline
script (`LANG_SCRIPT` in `lib/lang.js`) sets the direction before the first paint and keeps the page hidden until
the app has switched to English, so there is no Arabic flash. Tab titles follow the language in the browser.

The dashboard is bilingual too (Arabic RTL by default, English LTR) and shares the same cookie: the EN/ع switch in
the dashboard header (and on the login page) changes the whole interface, the language list rows are shown in,
and the language "View live site" opens in. Interface strings live in `lib/admin/i18n.js`; field labels in the
schemas (`lib/cms/schema.js`, `lib/admin/collections.js`) are `{ en, ar }` objects.
