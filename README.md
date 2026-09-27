# TOP POWER – MEP Engineering Supplies

Bilingual (Arabic RTL default / English LTR) website built with Next.js 15 (App Router), Tailwind CSS v4 and Framer Motion.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where to edit

| What | File |
|---|---|
| Phone numbers, WhatsApp, email, social links, address | `lib/site.js` |
| UI text (AR / EN) | `lib/i18n.js` |
| Product lines → sub-types → brands / shapes / sizes | `lib/data/products.js` |
| Product photos | `public/images/catalog/` (set `image` on a group or brand) |
| Datasheets (PDF) | `public/datasheets/` (set `datasheet: '/datasheets/x.pdf'`) |
| Brands, projects, certifications, timeline, documents | `lib/data/company.js` |
| Blog articles | `lib/data/blog.js` |
| Colors, glass styles, animations | `app/globals.css` (`@theme`) |
| Contact form backend | `app/api/contact/route.js` (currently logs; connect email/CRM) |

## Structure

```
app/                 routes: / , /about, /products, /blog, /contact, /api/contact
components/layout/   Navbar, Footer, FloatingActions, PreFooterCTA, SiteShell
components/ui/       Hero, GlassCard (cursor spotlight), Modal, MagneticButton, Reveal, Counter
components/home|about|products|blog|contact/   page sections
public/images/       logo, products, brands, projects, documents, brochure pages
scripts/             one-off image-cropping scripts used to extract assets from the profile PDF
```

## Products

Five lines, each with its own page: `/products/pipes`, `/products/fittings`, `/products/valves`,
`/products/sprinklers`, `/products/cabinets`. Link straight to a sub-type tab with a hash, e.g.
`/products/fittings#grooved` or `/products/valves#tamper`. Items without a photo show a line-art icon
until `image` is set.

## Language

The language is stored in the `tp-lang` cookie, so the server renders the chosen language, direction
and page titles on first paint. Pages are therefore rendered per request (dynamic).
