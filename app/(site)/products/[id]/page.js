import { notFound } from 'next/navigation';
import ProductContent from '@/components/products/ProductContent';
import { getCatalog, getCatalogs, getPage, getSiteSettings } from '@/lib/cms/queries';
import { ogImage, socialMeta } from '@/lib/cms/seo';
import { DEFAULT_LANG } from '@/lib/lang';

// `id` is the category slug (pipes, fittings, …). One static page per category
// at build time; a category added later gets its page with the next build.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getCatalog()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const lang = DEFAULT_LANG;
  const [catalog, s] = await Promise.all([getCatalog(), getSiteSettings()]);
  const p = catalog.find((x) => x.id === id);
  if (!p) return {};
  const siteName = s?.name[lang];
  return {
    title: p.name[lang],
    description: p.short[lang],
    // Link previews use the brand image (the logo) with the product line's name.
    ...socialMeta({ title: `${p.name[lang]} | ${siteName}`, description: p.short[lang], image: ogImage(s?.ogImage, siteName), siteName, lang }),
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const [catalog, market, catalogs] = await Promise.all([getCatalog(), getPage('market'), getCatalogs()]);
  if (!catalog.some((p) => p.id === id)) notFound();
  return <ProductContent id={id} initial={{ catalog, market, catalogs }} />;
}
