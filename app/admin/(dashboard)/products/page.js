import ProductsEditor from '@/components/admin/editors/ProductsEditor';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'Market / Products', ar: 'السوق والمنتجات' });

export default function Page() {
  return <ProductsEditor />;
}
