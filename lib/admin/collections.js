// Field schemas for the dashboard's table editors. Field names match database
// columns (localized ones map to `<name>_ar` / `<name>_en`). Labels, help,
// placeholders and option labels are `{ en, ar }` for the bilingual dashboard.
// See lib/cms/schema.js for the field format.

import { SHAPE_KEYS } from '@/lib/cms/schema';

const published = {
  name: 'is_published',
  label: { en: 'Published', ar: 'منشور' },
  type: 'toggle',
  help: { en: 'Hidden from the public site when off.', ar: 'يُخفى من الموقع عند إيقافه.' },
};
const specs = {
  name: 'specs',
  label: { en: 'Technical specifications', ar: 'المواصفات الفنية' },
  type: 'repeater',
  itemLabel: 'label',
  addLabel: { en: 'specification', ar: 'مواصفة' },
  fields: [
    { name: 'label', label: { en: 'Label', ar: 'البند' }, type: 'text' },
    { name: 'value', label: { en: 'Value', ar: 'القيمة' }, type: 'text' },
  ],
};

// ------------------------------------------------------------------- catalog
// Dashboard names for the shape keys (the site's own labels are the `shapes.*` translations).
const SHAPE_LABELS = {
  elbow90: { en: '90° Elbow', ar: 'كوع 90°' },
  elbow45: { en: '45° Elbow', ar: 'كوع 45°' },
  tee: { en: 'Tee', ar: 'تي' },
  reducer: { en: 'Reducer', ar: 'مسلوب' },
  bushing: { en: 'Bushing', ar: 'بوش' },
  cap: { en: 'Cap', ar: 'طبة' },
  union: { en: 'Union', ar: 'يونيون' },
  coupling: { en: 'Coupling', ar: 'كوبلنج' },
  socket: { en: 'Socket', ar: 'جلبة' },
  cross: { en: 'Cross', ar: 'صليب' },
  pendent: { en: 'Pendent', ar: 'متدلي' },
  upright: { en: 'Upright', ar: 'قائم' },
  sidewall: { en: 'Sidewall', ar: 'جانبي' },
};

export const categoryFields = [
  { name: 'name', label: { en: 'Category name', ar: 'اسم التصنيف' }, type: 'text', required: true },
  {
    name: 'slug',
    label: { en: 'URL slug', ar: 'الرابط المختصر (slug)' },
    type: 'slug',
    from: 'name',
    required: true,
    half: true,
    help: { en: 'Page address: /products/<slug>', ar: 'عنوان الصفحة: \u2066/products/<slug>\u2069' },
  },
  { name: 'icon', label: { en: 'Fallback icon', ar: 'الأيقونة البديلة' }, type: 'icon', half: true },
  { name: 'short', label: { en: 'Short description (cards)', ar: 'وصف مختصر (للبطاقات)' }, type: 'textarea', rows: 2 },
  { name: 'description', label: { en: 'Full description', ar: 'الوصف الكامل' }, type: 'textarea', rows: 4 },
  { name: 'cover_image', label: { en: 'Cover image', ar: 'صورة الغلاف' }, type: 'image', folder: 'categories' },
  { name: 'certs', label: { en: 'Certifications', ar: 'الاعتمادات' }, type: 'tags', localized: false, half: true, placeholder: 'UL, FM, ISO…' },
  { name: 'standards', label: { en: 'Standards', ar: 'المعايير' }, type: 'text', localized: false, half: true, placeholder: 'ASTM A53 / A106 Grade B' },
  { name: 'sizes_label', label: { en: 'Sizes summary', ar: 'ملخص المقاسات' }, type: 'text' },
  { name: 'pressure_label', label: { en: 'Pressure rating summary', ar: 'ملخص ضغط التشغيل' }, type: 'text' },
  {
    name: 'brands',
    label: { en: 'Brands (chips on the catalog)', ar: 'العلامات التجارية (تظهر في الكتالوج)' },
    type: 'repeater',
    itemLabel: 'name',
    addLabel: { en: 'brand', ar: 'علامة تجارية' },
    fields: [{ name: 'name', label: { en: 'Brand name', ar: 'اسم العلامة' }, type: 'text' }],
  },
  specs,
  { name: 'items', label: { en: 'Included items', ar: 'المنتجات المتضمنة' }, type: 'tags', localized: true },
  { name: 'applications', label: { en: 'Applications', ar: 'الاستخدامات' }, type: 'tags', localized: true },
  { name: 'brochure', label: { en: 'Catalog / brochure pages', ar: 'صفحات الكتالوج' }, type: 'gallery', folder: 'brochure' },
  { name: 'show_on_home', label: { en: 'Show in the home page bento grid', ar: 'إظهار في شبكة المنتجات بالصفحة الرئيسية' }, type: 'toggle' },
  published,
];

export const productFields = [
  { name: 'category_id', label: { en: 'Category', ar: 'التصنيف' }, type: 'select', required: true, half: true },
  { name: 'icon', label: { en: 'Fallback icon', ar: 'الأيقونة البديلة' }, type: 'icon', half: true },
  { name: 'name', label: { en: 'Product title', ar: 'اسم المنتج' }, type: 'text', required: true },
  {
    name: 'slug',
    label: { en: 'Slug', ar: 'الرابط المختصر (slug)' },
    type: 'slug',
    from: 'name',
    required: true,
    help: { en: 'Deep link: /products/<category>#<slug>', ar: 'رابط مباشر: \u2066/products/<category>#<slug>\u2069' },
  },
  { name: 'description', label: { en: 'Description', ar: 'الوصف' }, type: 'textarea', rows: 3 },
  { name: 'cover_image', label: { en: 'Main image', ar: 'الصورة الرئيسية' }, type: 'image', folder: 'products' },
  { name: 'gallery', label: { en: 'Image gallery', ar: 'معرض الصور' }, type: 'gallery', folder: 'products' },
  {
    name: 'sizes',
    label: { en: 'Available sizes', ar: 'المقاسات المتاحة' },
    type: 'tags',
    localized: false,
    placeholder: '½", ¾", 1"…',
    help: { en: 'Each size becomes a “request a quote” button.', ar: 'كل مقاس يظهر كزر «اطلب عرض سعر».' },
  },
  { name: 'pressure', label: { en: 'Pressure rating', ar: 'ضغط التشغيل' }, type: 'text', placeholder: '300 PSI' },
  { name: 'standard', label: { en: 'Standard', ar: 'المعيار' }, type: 'text', localized: false, placeholder: 'ASTM A536 · UL / FM' },
  specs,
  {
    name: 'brands',
    label: { en: 'Brands', ar: 'العلامات التجارية' },
    type: 'repeater',
    itemLabel: 'name',
    addLabel: { en: 'brand', ar: 'علامة تجارية' },
    fields: [
      { name: 'name', label: { en: 'Brand name', ar: 'اسم العلامة' }, type: 'text' },
      { name: 'is_primary', label: { en: 'Primary brand', ar: 'العلامة الأساسية' }, type: 'toggle' },
      { name: 'logo', label: { en: 'Brand logo', ar: 'شعار العلامة' }, type: 'image', folder: 'brands', half: true },
      { name: 'image', label: { en: 'Product photo for this brand', ar: 'صورة المنتج لهذه العلامة' }, type: 'image', folder: 'products', half: true },
      { name: 'desc', label: { en: 'Brand description', ar: 'وصف العلامة' }, type: 'textarea', rows: 2 },
      { name: 'datasheet', label: { en: 'Datasheet (PDF)', ar: 'الداتاشيت (PDF)' }, type: 'file', folder: 'datasheets' },
    ],
  },
  {
    name: 'shapes',
    label: { en: 'Available shapes', ar: 'الأشكال المتاحة' },
    type: 'repeater',
    itemLabel: 'key',
    addLabel: { en: 'shape', ar: 'شكل' },
    fields: [
      { name: 'key', label: { en: 'Shape', ar: 'الشكل' }, type: 'select', options: SHAPE_KEYS.map((k) => ({ value: k, label: SHAPE_LABELS[k] || k })), half: true },
      { name: 'image', label: { en: 'Photo (optional)', ar: 'صورة (اختياري)' }, type: 'image', folder: 'products', half: true },
    ],
  },
  published,
];

// --------------------------------------------------------------------- blogs
export const BLOG_STATUS = [
  { value: 'draft', label: { en: 'Draft', ar: 'مسودة' } },
  { value: 'published', label: { en: 'Published', ar: 'منشور' } },
];

export const blogFields = [
  { name: 'title', label: { en: 'Title', ar: 'العنوان' }, type: 'text', required: true },
  { name: 'slug', label: { en: 'Slug', ar: 'الرابط المختصر (slug)' }, type: 'slug', from: 'title', required: true },
  { name: 'status', label: { en: 'Status', ar: 'الحالة' }, type: 'select', required: true, half: true, options: BLOG_STATUS },
  {
    name: 'display',
    label: { en: 'Placement', ar: 'مكان الظهور' },
    type: 'select',
    required: true,
    half: true,
    help: { en: 'Only one article can be the hero.', ar: 'يمكن لمقال واحد فقط أن يكون المقال المميز.' },
    options: [
      { value: 'grid', label: { en: 'Grid article', ar: 'مقال في الشبكة' } },
      { value: 'hero', label: { en: 'Hero (featured) article', ar: 'المقال المميز (Hero)' } },
    ],
  },
  {
    name: 'published_at',
    label: { en: 'Publish date', ar: 'تاريخ النشر' },
    type: 'date',
    half: true,
    help: { en: 'Future dates stay hidden until then.', ar: 'التواريخ المستقبلية تظل مخفية حتى موعدها.' },
  },
  { name: 'read_time', label: { en: 'Reading time (minutes)', ar: 'مدة القراءة (بالدقائق)' }, type: 'number', half: true, min: 1, max: 120 },
  { name: 'category', label: { en: 'Category label', ar: 'التصنيف' }, type: 'text' },
  { name: 'featured_image', label: { en: 'Featured image', ar: 'الصورة البارزة' }, type: 'image', folder: 'blog' },
  { name: 'excerpt', label: { en: 'Excerpt', ar: 'المقتطف' }, type: 'textarea', rows: 3 },
  { name: 'body', label: { en: 'Full article (Markdown)', ar: 'المقال كاملاً (Markdown)' }, type: 'markdown' },
];

// ----------------------------------------------------------------- documents
export const DOC_TYPES = [
  { value: 'tax_card', label: { en: 'Tax card', ar: 'البطاقة الضريبية' } },
  { value: 'commercial_register', label: { en: 'Commercial register', ar: 'السجل التجاري' } },
  { value: 'vat', label: { en: 'VAT certificate', ar: 'شهادة القيمة المضافة' } },
  { value: 'importers_card', label: { en: 'Importers card', ar: 'بطاقة المستوردين' } },
  { value: 'certificate', label: { en: 'Certificate', ar: 'شهادة' } },
  { value: 'other', label: { en: 'Other', ar: 'أخرى' } },
];

export const documentFields = [
  { name: 'doc_type', label: { en: 'Document type', ar: 'نوع المستند' }, type: 'select', required: true, half: true, options: DOC_TYPES },
  { ...published, half: true },
  { name: 'title', label: { en: 'Title', ar: 'العنوان' }, type: 'text', required: true },
  { name: 'description', label: { en: 'Description', ar: 'الوصف' }, type: 'textarea', rows: 2 },
  { name: 'image_url', label: { en: 'Preview image (shown in the gallery)', ar: 'صورة المعاينة (تظهر في المعرض)' }, type: 'image', folder: 'documents' },
  { name: 'file_url', label: { en: 'Original file (PDF, optional)', ar: 'الملف الأصلي (PDF، اختياري)' }, type: 'file', folder: 'documents' },
];

// ---------------------------------------------------------- partners/projects
export const partnerFields = [
  {
    name: 'title',
    label: { en: 'Brand name', ar: 'اسم العلامة' },
    type: 'text',
    required: 'en',
    help: { en: 'Arabic is optional — the English name is used if empty.', ar: 'الاسم العربي اختياري — يُستخدم الاسم الإنجليزي إن تُرك فارغاً.' },
  },
  { name: 'image_url', label: { en: 'Logo', ar: 'الشعار' }, type: 'image', folder: 'partners' },
  { name: 'website_url', label: { en: 'Website', ar: 'الموقع الإلكتروني' }, type: 'url', placeholder: 'https://' },
  published,
];

export const projectFields = [
  { name: 'title', label: { en: 'Project name', ar: 'اسم المشروع' }, type: 'text', required: true },
  { name: 'location', label: { en: 'Location', ar: 'الموقع' }, type: 'text' },
  { name: 'category', label: { en: 'Sector / type', ar: 'القطاع / النوع' }, type: 'text' },
  { name: 'image_url', label: { en: 'Photo', ar: 'الصورة' }, type: 'image', folder: 'projects' },
  published,
];

// ------------------------------------------------------------- site settings
const link = [
  { name: 'label', label: { en: 'Label', ar: 'النص' }, type: 'text' },
  { name: 'href', label: { en: 'Link', ar: 'الرابط' }, type: 'text', localized: false, placeholder: '/about', half: true },
  { name: 'visible', label: { en: 'Visible', ar: 'ظاهر' }, type: 'toggle', half: true },
];

export const settingsGroups = {
  general: [
    { name: 'site_name', label: { en: 'Site name (browser tab suffix)', ar: 'اسم الموقع (يظهر في تبويب المتصفح)' }, type: 'text' },
    { name: 'logo_text', label: { en: 'Logo wordmark', ar: 'نص الشعار' }, type: 'text', localized: false, half: true },
    { name: 'certifications_strip', label: { en: 'Footer certifications line', ar: 'سطر الاعتمادات في الفوتر' }, type: 'text', localized: false, half: true },
    { name: 'tagline', label: { en: 'Tagline (under the logo)', ar: 'الشعار النصي (تحت اللوجو)' }, type: 'text' },
    { name: 'legal_name', label: { en: 'Registered company name', ar: 'الاسم القانوني للشركة' }, type: 'text' },
    { name: 'importers_number', label: { en: 'Importers register no.', ar: 'رقم سجل المستوردين' }, type: 'text', localized: false, half: true },
    { name: 'tax_card_number', label: { en: 'Tax card no.', ar: 'رقم البطاقة الضريبية' }, type: 'text', localized: false, half: true },
    { name: 'vat_registered', label: { en: 'Show “VAT registered” in the footer', ar: 'إظهار «مسجل بضريبة القيمة المضافة» في الفوتر' }, type: 'toggle' },
  ],
  seo: [
    {
      name: 'site_url',
      label: { en: 'Public site URL', ar: 'رابط الموقع' },
      type: 'url',
      placeholder: 'https://toppower.com',
      help: { en: 'Used for absolute links in social previews.', ar: 'يُستخدم في روابط المعاينة عند المشاركة.' },
    },
    { name: 'meta_title', label: { en: 'Default page title', ar: 'عنوان الصفحة الافتراضي' }, type: 'text' },
    { name: 'meta_description', label: { en: 'Default meta description', ar: 'الوصف الافتراضي لمحركات البحث' }, type: 'textarea', rows: 2 },
  ],
  navigation: [
    { name: 'nav_links', label: { en: 'Navbar links', ar: 'روابط القائمة العلوية' }, type: 'repeater', itemLabel: 'label', addLabel: { en: 'link', ar: 'رابط' }, fields: link },
    { name: 'footer_links', label: { en: 'Footer “Quick links”', ar: 'روابط الفوتر السريعة' }, type: 'repeater', itemLabel: 'label', addLabel: { en: 'link', ar: 'رابط' }, fields: link },
  ],
  floating: [
    {
      name: 'whatsapp_number',
      label: { en: 'WhatsApp number', ar: 'رقم واتساب' },
      type: 'text',
      localized: false,
      half: true,
      placeholder: '201000000000',
      help: { en: 'International format, digits only (no + or spaces).', ar: 'بالصيغة الدولية، أرقام فقط (بدون + أو مسافات).' },
    },
    { name: 'call_number', label: { en: 'Call button number', ar: 'رقم زر الاتصال' }, type: 'text', localized: false, half: true, placeholder: '+201000000000' },
    { name: 'whatsapp_greeting', label: { en: 'WhatsApp pre-filled message', ar: 'رسالة واتساب الجاهزة' }, type: 'text' },
  ],
  social: [
    {
      name: 'facebook_url',
      label: { en: 'Facebook', ar: 'فيسبوك' },
      type: 'url',
      placeholder: 'https://facebook.com/…',
      help: { en: 'Leave empty to hide the icon.', ar: 'اتركه فارغاً لإخفاء الأيقونة.' },
    },
    { name: 'instagram_url', label: { en: 'Instagram', ar: 'إنستجرام' }, type: 'url', placeholder: 'https://instagram.com/…' },
    { name: 'tiktok_url', label: { en: 'TikTok', ar: 'تيك توك' }, type: 'url', placeholder: 'https://tiktok.com/@…' },
  ],
  branding: [
    { name: 'logo_url', label: { en: 'Logo mark (hexagon)', ar: 'رمز الشعار (السداسي)' }, type: 'image', folder: 'branding', half: true },
    { name: 'logo_full_url', label: { en: 'Full logo', ar: 'الشعار الكامل' }, type: 'image', folder: 'branding', half: true },
    { name: 'favicon_url', label: { en: 'Favicon', ar: 'أيقونة المتصفح' }, type: 'image', folder: 'branding', half: true },
    { name: 'og_image_url', label: { en: 'Social share image', ar: 'صورة المشاركة' }, type: 'image', folder: 'branding', half: true },
    { name: 'color_primary', label: { en: 'Primary (deep emerald)', ar: 'اللون الأساسي (أخضر داكن)' }, type: 'color', keepEmpty: true },
    { name: 'color_secondary', label: { en: 'Secondary (emerald)', ar: 'اللون الثانوي (أخضر)' }, type: 'color', keepEmpty: true },
    { name: 'color_accent', label: { en: 'Accent (gold)', ar: 'لون التمييز (ذهبي)' }, type: 'color', keepEmpty: true },
  ],
  contact: [
    { name: 'phones', label: { en: 'Phone numbers', ar: 'أرقام الهاتف' }, type: 'tags', localized: false, placeholder: '+20 100 000 0000' },
    { name: 'email', label: { en: 'Email', ar: 'البريد الإلكتروني' }, type: 'text', localized: false },
    { name: 'address', label: { en: 'Office address', ar: 'عنوان المكتب' }, type: 'text' },
    { name: 'working_hours', label: { en: 'Working hours', ar: 'مواعيد العمل' }, type: 'text' },
    {
      name: 'map_embed_url',
      label: { en: 'Google Maps embed', ar: 'خريطة جوجل' },
      type: 'embed',
      help: {
        en: 'Google Maps → Share → Embed a map → copy HTML, then paste it here.',
        ar: 'خرائط جوجل ← مشاركة ← تضمين خريطة ← انسخ كود HTML والصقه هنا.',
      },
    },
  ],
};

export const pageSeoFields = [
  {
    name: 'meta_title',
    label: { en: 'Page title (browser tab & Google)', ar: 'عنوان الصفحة (المتصفح وجوجل)' },
    type: 'text',
    help: { en: 'Empty = the site default.', ar: 'إذا تُرك فارغاً يُستخدم العنوان الافتراضي للموقع.' },
  },
  { name: 'meta_description', label: { en: 'Meta description', ar: 'الوصف لمحركات البحث' }, type: 'textarea', rows: 2 },
  { name: 'og_image', label: { en: 'Social share image', ar: 'صورة المشاركة' }, type: 'image', folder: 'seo' },
];
