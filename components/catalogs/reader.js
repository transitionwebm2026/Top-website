'use client';

import dynamic from 'next/dynamic';
import { loadPdfjs } from '@/lib/pdf';

// The viewer (and pdf.js with it) loads when a catalog is first hovered or opened.
const loadReader = () => import('./FlipbookReader');
export const FlipbookReader = dynamic(loadReader, { ssr: false });
export const preloadReader = () => {
  loadReader();
  loadPdfjs().catch(() => {});
};

export const formatSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
