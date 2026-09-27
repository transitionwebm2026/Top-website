'use client';

import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { telHref, waHref } from '@/lib/site';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';

/** Fixed bottom-left WhatsApp + call buttons (physical left in both languages). */
export default function FloatingActions() {
  const { t, pick } = useLang();
  const greeting = pick({ ar: 'مرحباً توب باور، أريد الاستفسار عن', en: 'Hello TOP POWER, I would like to ask about' });

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col-reverse gap-3.5">
      <motion.a
        href={waHref(greeting)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.cta.whatsapp}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,0.6)]"
      >
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-whatsapp" />
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-whatsapp [animation-delay:1.1s]" />
        <WhatsAppIcon width={28} height={28} className="relative" />
      </motion.a>

      <motion.a
        href={telHref()}
        aria-label={t.cta.call}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.35, type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.1, rotate: -8 }}
        whileTap={{ scale: 0.92 }}
        className="grid h-14 w-14 animate-float place-items-center rounded-full border border-gold/60 bg-gradient-to-br from-emerald-mid to-emerald-deep text-gold shadow-[0_10px_30px_-5px_rgba(205,176,116,0.45)]"
      >
        <Phone size={24} />
      </motion.a>
    </div>
  );
}
