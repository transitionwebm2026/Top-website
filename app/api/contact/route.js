import { NextResponse } from 'next/server';

// Receives contact-form submissions.
// TODO: forward to email/CRM (e.g. Resend, Nodemailer SMTP, or a Google Sheet webhook).
export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const msg = {
    name: clean(data.name, 120),
    email: clean(data.email, 200),
    phone: clean(data.phone, 40),
    subject: clean(data.subject, 200),
    message: clean(data.message, 5000),
  };

  if (!msg.name || !msg.phone || !msg.message || !/^\S+@\S+\.\S+$/.test(msg.email)) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid fields' }, { status: 422 });
  }

  console.log('[contact] new message', { ...msg, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
