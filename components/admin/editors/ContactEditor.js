'use client';

import { useMemo, useState } from 'react';
import { Archive, Inbox, Mail, MessagesSquare, Phone, Save, Trash2 } from 'lucide-react';
import { useTable } from '@/lib/admin/hooks';
import { settingsGroups } from '@/lib/admin/collections';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import PageEditor from '../PageEditor';
import { useAdmin } from '../AdminContext';
import { Dialog, useFeedback } from '../feedback';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorNote, Label, Select, Spinner, Textarea, cx } from '../ui';
import SettingsForm from './SettingsForm';

const STATUSES = [
  { value: 'new', tone: 'gold' },
  { value: 'read', tone: 'blue' },
  { value: 'replied', tone: 'green' },
  { value: 'archived', tone: 'neutral' },
];
const toneOf = (s) => STATUSES.find((x) => x.value === s)?.tone || 'neutral';

/** Inbox for messages sent through the public contact form. */
export function Submissions({ limit }) {
  const { t, locale, refreshNewMessages } = useAdmin();
  const { toast, fail, confirm } = useFeedback();
  const { rows, loading, error, patch, remove } = useTable('contact_submissions', { order: [['created_at', false]] });
  const [filter, setFilter] = useState('new');
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState('');

  const fmt = (d) => new Date(d).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s.value, rows.filter((r) => r.status === s.value).length])), [rows]);
  const list = (filter === 'all' ? rows : rows.filter((r) => r.status === filter)).slice(0, limit || undefined);
  const open = rows.find((r) => r.id === openId);

  const setStatus = async (r, status) => {
    try {
      await patch(r.id, { status });
      refreshNewMessages();
    } catch (e) {
      fail(e);
    }
  };

  const view = (r) => {
    setOpenId(r.id);
    setNotes(r.notes || '');
    if (r.status === 'new') setStatus(r, 'read');
  };

  const del = async (r) => {
    if (!(await confirm({ title: t('inbox.deleteTitle'), message: t('inbox.deleteMsg', { name: r.name, email: r.email }), confirmLabel: t('common.delete'), danger: true }))) return;
    try {
      await remove(r.id);
      setOpenId(null);
      refreshNewMessages();
      toast(t('inbox.deleted'));
    } catch (e) {
      fail(e);
    }
  };

  const saveNotes = async () => {
    try {
      await patch(open.id, { notes: notes.trim() || null });
      toast(t('inbox.notesSaved'));
    } catch (e) {
      fail(e);
    }
  };

  const waDigits = (p) => p.replace(/\D/g, '');

  return (
    <Card>
      <CardHeader
        title={t('inbox.title')}
        description={t('inbox.desc')}
        actions={
          <div className="flex flex-wrap gap-1 rounded-xl bg-white/[0.04] p-1">
            {['all', ...STATUSES.map((s) => s.value)].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cx('rounded-lg px-2.5 py-1 text-xs font-semibold transition', filter === s ? 'bg-gold text-emerald-ink' : 'text-white/60 hover:text-white')}
              >
                {t(`status.${s}`)}
                {s !== 'all' && counts[s] > 0 && <span className="ms-1 opacity-70">{counts[s]}</span>}
              </button>
            ))}
          </div>
        }
      />
      {error && (
        <div className="p-5">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : !list.length ? (
        <EmptyState icon={Inbox} title={filter === 'new' ? t('inbox.emptyNew') : t('inbox.empty')} description={t('inbox.emptyDesc')} />
      ) : (
        <ul className="divide-y divide-white/5">
          {list.map((r) => (
            <li key={r.id}>
              <button onClick={() => view(r)} className="flex w-full items-start gap-3 px-5 py-3.5 text-start transition hover:bg-white/[0.03]">
                <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', r.status === 'new' ? 'bg-gold shadow-[0_0_10px_rgba(205,176,116,0.9)]' : 'bg-white/15')} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cx('font-semibold', r.status === 'new' ? 'text-white' : 'text-white/75')} dir="auto">
                      {r.name}
                    </span>
                    <Badge tone={toneOf(r.status)}>{t(`status.${r.status}`)}</Badge>
                    <span className="text-xs text-white/35">{fmt(r.created_at)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-white/50" dir="auto">
                    {r.subject ? <b className="font-semibold text-white/70">{r.subject} — </b> : null}
                    {r.message}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!open} onClose={() => setOpenId(null)} size="md" title={open ? t('inbox.from', { name: open.name }) : ''}>
        {open && (
          <div className="space-y-5 p-6">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <a href={`mailto:${open.email}`} className="flex items-center gap-2 text-gold-light hover:underline" dir="ltr">
                <Mail size={15} /> {open.email}
              </a>
              <a href={`tel:${open.phone}`} className="flex items-center gap-2 text-gold-light hover:underline" dir="ltr">
                <Phone size={15} /> {open.phone}
              </a>
              <p className="text-white/50">{t('inbox.received', { date: fmt(open.created_at) })}</p>
              <p className="text-white/50">{t('inbox.siteLang', { lang: t(`lang.${open.lang}`) })}</p>
            </div>
            {open.subject && (
              <p className="font-bold text-white" dir="auto">
                {open.subject}
              </p>
            )}
            <p className="rounded-2xl border border-white/10 bg-black/20 p-4 leading-relaxed whitespace-pre-wrap text-white/85" dir="auto">
              {open.message}
            </p>

            <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
              <div>
                <Label htmlFor="status">{t('inbox.status')}</Label>
                <Select id="status" value={open.status} onChange={(e) => setStatus(open, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {t(`status.${s.value}`)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">{t('inbox.notes')}</Label>
                <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('inbox.notesPh')} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                icon={Mail}
                href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject || t('inbox.replySubject')}`)}`}
                external
                onClick={() => open.status !== 'replied' && setStatus(open, 'replied')}
              >
                {t('inbox.reply')}
              </Button>
              <Button icon={WhatsAppIcon} href={`https://wa.me/${waDigits(open.phone)}`} external>
                {t('inbox.whatsapp')}
              </Button>
              <Button variant="ghost" icon={Save} onClick={saveNotes} disabled={(open.notes || '') === notes}>
                {t('inbox.saveNotes')}
              </Button>
              <Button variant="ghost" icon={Archive} onClick={() => setStatus(open, 'archived')} disabled={open.status === 'archived'}>
                {t('inbox.archive')}
              </Button>
              <Button variant="danger" icon={Trash2} onClick={() => del(open)} className="ms-auto">
                {t('common.delete')}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Card>
  );
}

const TABS = [
  { id: 'inbox', label: { en: 'Submissions', ar: 'الرسائل' }, icon: Inbox, render: () => <Submissions /> },
  {
    id: 'details',
    label: { en: 'Contact Details & Map', ar: 'بيانات التواصل والخريطة' },
    render: () => (
      <SettingsForm
        fields={settingsGroups.contact}
        title={{ en: 'Contact details', ar: 'بيانات التواصل' }}
        description={{
          en: 'Shown on the contact page and in the footer. WhatsApp / call buttons are under Global Settings → Floating buttons.',
          ar: 'تظهر في صفحة التواصل وفي الفوتر. أزرار واتساب والاتصال من الإعدادات العامة ← الأزرار العائمة.',
        }}
      />
    ),
  },
  { id: 'page', label: { en: 'Contact Page', ar: 'صفحة التواصل' }, sections: ['hero_section', 'contact_form'], hideFields: ['badges'] },
  { id: 'cta', label: { en: 'Pre-footer CTA', ar: 'دعوة التواصل' }, sections: ['pre_footer_cta'] },
];

export default function ContactEditor() {
  const { newMessages } = useAdmin();
  const tabs = useMemo(() => TABS.map((x) => (x.id === 'inbox' ? { ...x, badge: newMessages } : x)), [newMessages]);
  return (
    <PageEditor
      slug="contact_us"
      icon={MessagesSquare}
      title={{ en: 'Contact & Enquiries', ar: 'التواصل والاستفسارات' }}
      description={{ en: 'Messages, contact details and the contact page.', ar: 'الرسائل، بيانات التواصل وصفحة اتصل بنا.' }}
      tabs={tabs}
    />
  );
}
