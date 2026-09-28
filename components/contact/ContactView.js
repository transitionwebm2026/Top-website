'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { useSite } from '@/components/providers/SiteProvider';
import GlassCard from '@/components/ui/GlassCard';
import { Reveal } from '@/components/ui/Reveal';

const fields = [
  { name: 'name', type: 'text', autoComplete: 'name', half: true },
  { name: 'email', type: 'email', autoComplete: 'email', half: true },
  { name: 'phone', type: 'tel', autoComplete: 'tel', half: true },
  { name: 'subject', type: 'text', half: true },
];
// `website` is a honeypot: hidden from people, filled in by bots, rejected by the API.
const empty = { name: '', email: '', phone: '', subject: '', message: '', website: '' };

function Field({ name, label, type = 'text', value, onChange, error, textarea, half: _half, ...rest }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className="field relative">
      <Tag
        id={name}
        name={name}
        type={textarea ? undefined : type}
        value={value}
        onChange={onChange}
        placeholder=" "
        rows={textarea ? 5 : undefined}
        aria-invalid={!!error}
        dir={type === 'email' || type === 'tel' ? 'ltr' : undefined}
        className={`w-full resize-none rounded-2xl border bg-emerald-ink/40 px-4 pb-3 text-white transition outline-none focus:bg-emerald-ink/60 focus:shadow-[0_0_0_4px_rgba(205,176,116,0.12)] ${
          error ? 'border-red-400/70' : 'border-gold/20 focus:border-gold/80'
        } ${type === 'email' || type === 'tel' ? 'text-start rtl:text-right' : ''}`}
        {...rest}
      />
      <label htmlFor={name}>{label}</label>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs text-red-300">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Contact form + company details. Field labels come from the `contact.*`
 * translations, the form copy from the `contact_form` section (`content`), and
 * phones/email/address/hours/map from site settings.
 */
export default function ContactView({ content }) {
  const { t, pick, lang } = useLang();
  const site = useSite();
  const c = t.contact;
  const copy = pick(content) || {};
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [hover, setHover] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const validate = () => {
    const er = {};
    ['name', 'phone', 'message'].forEach((k) => !form[k].trim() && (er[k] = c.required));
    if (!form.email.trim()) er.email = c.required;
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = c.invalidEmail;
    setErrors(er);
    return !Object.keys(er).length;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      });
      if (!res.ok) throw new Error();
      setStatus('sent');
      setForm(empty);
    } catch {
      setStatus('error');
    }
  };

  const info = [
    site.phones.length > 0 && {
      icon: Phone,
      label: c.phones,
      content: site.phones.map((p) => (
        <a key={p} href={site.telHref(p)} dir="ltr" className="block hover:text-gold">
          {p}
        </a>
      )),
    },
    site.email && { icon: Mail, label: c.emailLabel, content: <a href={`mailto:${site.email}`} className="hover:text-gold">{site.email}</a> },
    pick(site.address) && { icon: MapPin, label: c.office, content: pick(site.address) },
    pick(site.hours) && { icon: Clock, label: c.hours, content: pick(site.hours) },
  ].filter(Boolean);

  const hoverProps = { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) };

  return (
    <section id="content" className="px-4 py-20 sm:px-6 lg:px-8">
      {/* Symmetric split; in Arabic the form (first child) sits on the right. Hovering either side lights up both. */}
      <div className="mx-auto grid max-w-7xl items-stretch gap-6 lg:grid-cols-2">
        <Reveal className="h-full">
          <GlassCard strong synced={hover} {...hoverProps} className="h-full p-6 sm:p-10">
            <div className="relative z-10">
              <h2 className="text-2xl font-black sm:text-3xl">{copy.form_title}</h2>
              {copy.form_description && <p className="mt-2 text-white/60">{copy.form_description}</p>}

              <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <Field key={f.name} {...f} label={c[f.name]} value={form[f.name]} onChange={onChange} error={errors[f.name]} />
                ))}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={onChange}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <div className="sm:col-span-2">
                  <Field name="message" label={c.message} textarea value={form.message} onChange={onChange} error={errors.message} />
                </div>

                <div className="flex flex-col gap-4 sm:col-span-2">
                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative inline-flex h-14 items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark font-bold text-emerald-ink shadow-[0_10px_40px_-10px_rgba(205,176,116,0.8)] disabled:opacity-80"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {status === 'sending' ? (
                        <motion.span key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={20} /> {c.sending}
                        </motion.span>
                      ) : (
                        <motion.span key="i" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                          <Send size={18} className="rtl:-scale-x-100" /> {c.send}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <AnimatePresence>
                    {status === 'sent' && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 rounded-2xl border border-whatsapp/40 bg-whatsapp/10 p-4 text-sm text-green-200"
                      >
                        <CheckCircle2 size={18} /> {copy.success_message}
                      </motion.p>
                    )}
                    {status === 'error' && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200"
                      >
                        {copy.error_message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.15} className="h-full">
          <GlassCard strong synced={hover} {...hoverProps} className="flex h-full flex-col gap-6 p-6 sm:p-10">
            <h2 className="relative z-10 text-2xl font-black sm:text-3xl">{copy.info_title}</h2>
            <div className="relative z-10 grid gap-4 sm:grid-cols-2">
              {info.map(({ icon: Icon, label, content }) => (
                <div key={label} className="rounded-2xl border border-gold/15 bg-white/[0.03] p-4 transition hover:border-gold/50">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15">
                      <Icon size={16} />
                    </span>
                    {label}
                  </div>
                  <div className="mt-2 text-[0.95rem] font-semibold text-white/85">{content}</div>
                </div>
              ))}
            </div>
            {site.mapEmbedUrl && (
              <div className="relative z-10 min-h-[300px] flex-1 overflow-hidden rounded-2xl border border-gold/25">
                <iframe
                  title={`${site.logoText} map`}
                  src={site.mapEmbedUrl}
                  className="map-dark absolute inset-0 h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
