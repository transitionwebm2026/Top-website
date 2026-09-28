import { notFound } from 'next/navigation';
import ProductPageView from '@/components/products/ProductPageView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { getCatalog, getPage, getSiteSettings } from '@/lib/cms/queries';
import { ogImage, socialMeta } from '@/lib/cms/seo';
import { getLang } from '@/lib/lang';

// `id` is the category slug (pipes, fittings, …). Product line pages share the
// market page's pre-footer CTA.

export async function generateMetadata({ params }) {
  const { id } = await params;
  const [catalog, lang, s] = await Promise.all([getCatalog(), getLang(), getSiteSettings()]);
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
  const [catalog, market] = await Promise.all([getCatalog(), getPage('market')]);
  const product = catalog.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <>
      <ProductPageView product={product} others={catalog.filter((p) => p.id !== id)} />
      <PreFooterCTA content={market.sections.pre_footer_cta} />
    </>
  );
}
