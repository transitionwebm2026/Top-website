'use client';

import PageTitle from '@/components/layout/PageTitle';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { live, useLiveContent } from '@/lib/cms/live';
import ProductPageView from './ProductPageView';

/**
 * Product line page (`id` = category slug); `initial` is the build-time content,
 * refreshed from Supabase on load. Shares the market page's pre-footer CTA.
 */
export default function ProductContent({ id, initial }) {
  const { catalog, market, catalogs } = useLiveContent(initial, {
    catalog: live.catalog(initial.catalog),
    market: live.page('market'),
    catalogs: live.catalogs,
  });
  // Unpublished since the build → keep showing the built page until the next build removes it.
  const product = catalog.find((p) => p.id === id) ?? initial.catalog.find((p) => p.id === id);
  return (
    <>
      <PageTitle title={product.name} />
      <ProductPageView product={product} others={catalog.filter((p) => p.id !== id)} catalogs={catalogs} />
      <PreFooterCTA content={market.sections.pre_footer_cta} />
    </>
  );
}
