import { notFound } from 'next/navigation';
import { products } from '@/lib/data/products';
import ProductPageView from '@/components/products/ProductPageView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { getLang } from '@/lib/lang';

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = products.find((x) => x.id === id);
  if (!p) return {};
  const lang = await getLang();
  return {
    title: p.name[lang],
    description: p.short[lang],
    openGraph: { images: [p.image || '/images/logo-full.jpg'] },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  if (!products.some((p) => p.id === id)) notFound();
  return (
    <>
      <ProductPageView id={id} />
      <PreFooterCTA />
    </>
  );
}
