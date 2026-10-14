// Phone helpers shared by the dashboard and the public site.

/** Arabic-Indic (٠-٩) and Persian (۰-۹) digits → ASCII, so numbers typed on an Arabic keyboard work. */
const toAsciiDigits = (s) => String(s ?? '').replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xf));

/**
 * Any way a number gets typed → the digits-only international form wa.me needs.
 *   "+20 109 979 3905" · "00201099793905" · "01099793905" · "٠١٠٩٩٧٩٣٩٠٥" → "201099793905"
 * A local Egyptian mobile (01x + 8 digits) gets the +20 country code added.
 */
export function waNumber(input) {
  let d = toAsciiDigits(input).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (/^01[0125]\d{8}$/.test(d)) d = `2${d}`;
  return d;
}

/** Same length rule as the `whatsapp_number` check constraint in the database. */
export const isWaNumber = (d) => /^[0-9]{6,15}$/.test(d);
