'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useLang } from '@/components/providers/LanguageProvider';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingActions from './FloatingActions';

/**
 * Global chrome. On language change the content fades and slides back in —
 * without remounting, so page state (open tabs, scroll, form input) is kept.
 */
export default function SiteShell({ children }) {
  const { lang } = useLang();
  const controls = useAnimationControls();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    controls.set({ opacity: 0, y: 14 });
    controls.start({ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } });
  }, [lang, controls]);

  return (
    <>
      <Navbar />
      <motion.div animate={controls}>
        <main>{children}</main>
        <Footer />
      </motion.div>
      <FloatingActions />
    </>
  );
}
