// Content schemas shared by the dashboard editors and the frontend renderers.
//
// A field describes one editable value:
//   { name, label, type, localized?, help?, placeholder?, options?, fields?, itemLabel?, addLabel? }
// Text props (label, help, placeholder, option labels) are { en, ar } objects
// so the dashboard can be shown in either language.
//
// Types: text · textarea · markdown · number · url · image · file · gallery · tags
//        toggle · select · color · icon · repeater (nested `fields`)
//
// Localized fields hold one value per language. In database rows they live in
// `<name>_ar` / `<name>_en` columns (or keys inside JSON array items); in
// section content they live in `content_ar.<name>` / `content_en.<name>`.

const LOCALIZED_BY_DEFAULT = new Set(['text', 'textarea', 'markdown']);

export const isLocalized = (field) => field.localized ?? LOCALIZED_BY_DEFAULT.has(field.type);

/** Icon names drawn by components/products/ShapeIcon.js. */
export const ICON_NAMES = [
  'pipe', 'fitting', 'valve', 'sprinkler', 'cabinet', 'elbow90', 'elbow45', 'tee', 'cross', 'reducer',
  'bushing', 'cap', 'union', 'socket', 'coupling', 'check', 'ball', 'switch', 'drain', 'balance',
  'strainer', 'zone', 'pendent', 'upright', 'sidewall',
];

/** Shapes selectable on a product; labels come from the `shapes.*` translations. */
export const SHAPE_KEYS = [
  'elbow90', 'elbow45', 'tee', 'reducer', 'bushing', 'cap', 'union', 'coupling', 'socket', 'cross',
  'pendent', 'upright', 'sidewall',
];

const eyebrow = { name: 'eyebrow', label: { en: 'Eyebrow (small label above the title)', ar: 'عنوان تمهيدي (نص صغير فوق العنوان)' }, type: 'text' };
const title = { name: 'title', label: { en: 'Title', ar: 'العنوان' }, type: 'text' };

// -----------------------------------------------------------------------------
// Page sections — keyed by `sections.type`. Labels are `{ en, ar }` for the
// bilingual dashboard.
// -----------------------------------------------------------------------------
export const SECTION_TYPES = {
  hero: {
    label: { en: 'Hero', ar: 'الواجهة الرئيسية' },
    fields: [
      { name: 'title', label: { en: 'Title — first line', ar: 'العنوان — السطر الأول' }, type: 'text' },
      { name: 'title_highlight', label: { en: 'Title — second line (gold highlight)', ar: 'العنوان — السطر الثاني (باللون الذهبي)' }, type: 'text' },
      { name: 'description', label: { en: 'Subtitle / paragraph', ar: 'النص التعريفي' }, type: 'textarea' },
      { name: 'image', label: { en: 'Background image', ar: 'صورة الخلفية' }, type: 'image' },
      { name: 'cta_primary_label', label: { en: 'Primary button text', ar: 'نص الزر الأساسي' }, type: 'text' },
      { name: 'cta_primary_href', label: { en: 'Primary button link', ar: 'رابط الزر الأساسي' }, type: 'text', localized: false, placeholder: '/contact' },
      { name: 'cta_secondary_label', label: { en: 'Secondary button text', ar: 'نص الزر الثانوي' }, type: 'text' },
      { name: 'cta_secondary_href', label: { en: 'Secondary button link', ar: 'رابط الزر الثانوي' }, type: 'text', localized: false, placeholder: '/products' },
      {
        name: 'badges',
        label: { en: 'Floating badges (home page only)', ar: 'الشارات العائمة (الصفحة الرئيسية فقط)' },
        type: 'repeater',
        itemLabel: 'label',
        addLabel: { en: 'badge', ar: 'شارة' },
        fields: [{ name: 'label', label: { en: 'Badge text', ar: 'نص الشارة' }, type: 'text' }],
      },
    ],
  },

  about_summary: {
    label: { en: 'About summary', ar: 'نبذة عن الشركة' },
    fields: [
      { name: 'counter_value', label: { en: 'Big counter value', ar: 'رقم العدّاد الكبير' }, type: 'number' },
      { name: 'counter_suffix', label: { en: 'Counter suffix', ar: 'لاحقة العدّاد' }, type: 'text', localized: false, placeholder: '+' },
      { name: 'counter_label', label: { en: 'Counter caption', ar: 'وصف العدّاد' }, type: 'text' },
      { name: 'title_prefix', label: { en: 'Gold prefix before the title', ar: 'بادئة ذهبية قبل العنوان' }, type: 'text', localized: false, placeholder: '15+' },
      title,
      { name: 'description', label: { en: 'Paragraph', ar: 'الفقرة' }, type: 'textarea' },
      { name: 'ring_text', label: { en: 'Rotating ring text', ar: 'نص الدائرة الدوّارة' }, type: 'text' },
      {
        name: 'stats',
        label: { en: 'Statistics', ar: 'الإحصائيات' },
        type: 'repeater',
        itemLabel: 'label',
        addLabel: { en: 'statistic', ar: 'إحصائية' },
        fields: [
          { name: 'value', label: { en: 'Value', ar: 'القيمة' }, type: 'number' },
          { name: 'suffix', label: { en: 'Suffix', ar: 'اللاحقة' }, type: 'text', localized: false },
          { name: 'label', label: { en: 'Caption', ar: 'الوصف' }, type: 'text' },
        ],
      },
    ],
  },

  heading: {
    label: { en: 'Section heading', ar: 'عنوان القسم' },
    fields: [eyebrow, title, { name: 'description', label: { en: 'Description (optional)', ar: 'الوصف (اختياري)' }, type: 'textarea' }],
  },

  key_projects: {
    label: { en: 'Key projects heading', ar: 'عنوان المشاريع' },
    fields: [eyebrow, title, { name: 'hint', label: { en: 'Navigation hint', ar: 'تلميح التنقل' }, type: 'text' }],
  },

  history: {
    label: { en: 'Company history', ar: 'تاريخ الشركة' },
    fields: [
      eyebrow,
      title,
      { name: 'image', label: { en: 'Story image', ar: 'صورة القصة' }, type: 'image' },
      { name: 'badge_value', label: { en: 'Badge number', ar: 'رقم الشارة' }, type: 'text', localized: false, placeholder: '20+' },
      { name: 'badge_line1', label: { en: 'Badge caption — line 1', ar: 'وصف الشارة — السطر الأول' }, type: 'text' },
      { name: 'badge_line2', label: { en: 'Badge caption — line 2', ar: 'وصف الشارة — السطر الثاني' }, type: 'text' },
      {
        name: 'timeline',
        label: { en: 'Timeline', ar: 'الخط الزمني' },
        type: 'repeater',
        itemLabel: 'title',
        addLabel: { en: 'milestone', ar: 'مرحلة' },
        fields: [
          { name: 'year', label: { en: 'Year / stage', ar: 'السنة / المرحلة' }, type: 'text' },
          { name: 'title', label: { en: 'Title', ar: 'العنوان' }, type: 'text' },
          { name: 'text', label: { en: 'Text', ar: 'النص' }, type: 'textarea' },
        ],
      },
    ],
  },

  mission_vision: {
    label: { en: 'Mission & goals', ar: 'الرسالة والأهداف' },
    fields: [
      eyebrow,
      title,
      { name: 'mission_title', label: { en: 'Mission card title', ar: 'عنوان بطاقة الرسالة' }, type: 'text' },
      { name: 'goals_title', label: { en: 'Goals card title', ar: 'عنوان بطاقة الأهداف' }, type: 'text' },
      {
        name: 'mission',
        label: { en: 'Mission points', ar: 'نقاط الرسالة' },
        type: 'repeater',
        itemLabel: 'text',
        addLabel: { en: 'point', ar: 'نقطة' },
        fields: [{ name: 'text', label: { en: 'Point', ar: 'النقطة' }, type: 'textarea' }],
      },
      {
        name: 'goals',
        label: { en: 'Goals', ar: 'الأهداف' },
        type: 'repeater',
        itemLabel: 'text',
        addLabel: { en: 'goal', ar: 'هدف' },
        fields: [{ name: 'text', label: { en: 'Goal', ar: 'الهدف' }, type: 'textarea' }],
      },
    ],
  },

  certifications: {
    label: { en: 'Certification badges', ar: 'شارات الاعتمادات' },
    fields: [
      eyebrow,
      title,
      {
        name: 'items',
        label: { en: 'Badges', ar: 'الشارات' },
        type: 'repeater',
        itemLabel: 'code',
        addLabel: { en: 'badge', ar: 'شارة' },
        fields: [
          { name: 'code', label: { en: 'Code (shown in the hexagon)', ar: 'الرمز (داخل الشكل السداسي)' }, type: 'text', localized: false },
          { name: 'name', label: { en: 'Name', ar: 'الاسم' }, type: 'text' },
          { name: 'desc', label: { en: 'Description', ar: 'الوصف' }, type: 'text' },
        ],
      },
    ],
  },

  legal_docs: {
    label: { en: 'Legal documents heading', ar: 'عنوان المستندات الرسمية' },
    fields: [
      eyebrow,
      title,
      { name: 'description', label: { en: 'Description', ar: 'الوصف' }, type: 'textarea' },
      { name: 'zoom_hint', label: { en: 'Zoom hint (inside the viewer)', ar: 'تلميح التكبير (داخل العارض)' }, type: 'text' },
      { name: 'download_label', label: { en: 'Download button text', ar: 'نص زر التحميل' }, type: 'text' },
    ],
  },

  contact_form: {
    label: { en: 'Contact form', ar: 'نموذج التواصل' },
    fields: [
      { name: 'form_title', label: { en: 'Form title', ar: 'عنوان النموذج' }, type: 'text' },
      { name: 'form_description', label: { en: 'Form description', ar: 'وصف النموذج' }, type: 'textarea' },
      { name: 'info_title', label: { en: 'Company details card title', ar: 'عنوان بطاقة بيانات الشركة' }, type: 'text' },
      { name: 'success_message', label: { en: 'Success message', ar: 'رسالة النجاح' }, type: 'text' },
      { name: 'error_message', label: { en: 'Error message', ar: 'رسالة الخطأ' }, type: 'text' },
    ],
  },

  cta: {
    label: { en: 'Pre-footer call to action', ar: 'دعوة للتواصل قبل الفوتر' },
    fields: [
      title,
      { name: 'description', label: { en: 'Description', ar: 'الوصف' }, type: 'textarea' },
      { name: 'whatsapp_label', label: { en: 'WhatsApp button text', ar: 'نص زر واتساب' }, type: 'text' },
      { name: 'call_label', label: { en: 'Call button text', ar: 'نص زر الاتصال' }, type: 'text' },
    ],
  },
};

// -----------------------------------------------------------------------------
// Section ⇄ form conversion
// -----------------------------------------------------------------------------
// The editors work on a flat "row" (`title_ar`, `title_en`, `image`, …) so the
// same field widgets serve both table rows and section content.

const emptyFor = (field) => {
  switch (field.type) {
    case 'repeater':
    case 'gallery':
    case 'tags':
      return [];
    case 'toggle':
      return false;
    case 'number':
      return 0;
    default:
      return '';
  }
};

/** Blank editor row for a list of fields. */
export function emptyRow(fields) {
  const row = {};
  for (const f of fields) {
    if (isLocalized(f)) {
      row[`${f.name}_ar`] = emptyFor(f);
      row[`${f.name}_en`] = emptyFor(f);
    } else {
      row[f.name] = f.default ?? emptyFor(f);
    }
  }
  return row;
}

/** content_ar + content_en → editor row. */
export function sectionToForm(fields, ar = {}, en = {}) {
  const row = {};
  for (const f of fields) {
    if (f.type === 'repeater') {
      const a = Array.isArray(ar?.[f.name]) ? ar[f.name] : [];
      const e = Array.isArray(en?.[f.name]) ? en[f.name] : [];
      row[f.name] = Array.from({ length: Math.max(a.length, e.length) }, (_, i) => sectionToForm(f.fields, a[i] || {}, e[i] || {}));
    } else if (isLocalized(f)) {
      row[`${f.name}_ar`] = ar?.[f.name] ?? emptyFor(f);
      row[`${f.name}_en`] = en?.[f.name] ?? emptyFor(f);
    } else {
      row[f.name] = ar?.[f.name] ?? en?.[f.name] ?? emptyFor(f);
    }
  }
  return row;
}

/** Editor row → { ar, en } content documents (language-neutral values mirrored). */
export function formToSection(fields, row = {}) {
  const ar = {};
  const en = {};
  for (const f of fields) {
    if (f.type === 'repeater') {
      const parts = (row[f.name] || []).map((item) => formToSection(f.fields, item));
      ar[f.name] = parts.map((p) => p.ar);
      en[f.name] = parts.map((p) => p.en);
    } else if (isLocalized(f)) {
      ar[f.name] = row[`${f.name}_ar`] ?? emptyFor(f);
      en[f.name] = row[`${f.name}_en`] ?? emptyFor(f);
    } else {
      const v = f.type === 'number' ? Number(row[f.name]) || 0 : row[f.name] ?? emptyFor(f);
      ar[f.name] = v;
      en[f.name] = v;
    }
  }
  return { ar, en };
}
