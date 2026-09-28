import SettingsEditor from '@/components/admin/editors/SettingsEditor';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'Global Settings', ar: 'الإعدادات العامة' });

export default function Page() {
  return <SettingsEditor />;
}
