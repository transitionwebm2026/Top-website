import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

/**
 * Contact-form endpoint. Validates the message and stores it in
 * `contact_submissions` with the anonymous key; RLS only allows inserting new
 * messages, and only admins can read them (Dashboard → Contact & Enquiries).
 */
export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot filled → a bot. Pretend success so it does not retry.
  if (typeof data.website === 'string' && data.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const msg = {
    name: clean(data.name, 120),
    email: clean(data.email, 200),
    phone: clean(data.phone, 40),
    subject: clean(data.subject, 200) || null,
    message: clean(data.message, 5000),
    lang: data.lang === 'en' ? 'en' : 'ar',
  };

  if (!msg.name || !msg.phone || !msg.message || !/^\S+@\S+\.\S+$/.test(msg.email)) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid fields' }, { status: 422 });
  }

  // No `.select()`: anonymous users may insert but not read submissions back.
  const { error } = await createPublicClient().from('contact_submissions').insert(msg);
  if (error) {
    console.error('[contact] insert failed:', error.code, error.message);
    return NextResponse.json({ ok: false, error: 'Could not save your message' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
