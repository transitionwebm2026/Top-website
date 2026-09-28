// Applies the brand colours from `site_settings` by overriding the Tailwind
// theme variables declared in app/globals.css (@theme). Values are validated as
// #RRGGBB here and by a CHECK constraint in the database, so nothing but a
// colour can reach the stylesheet.

const HEX = /^#[0-9a-f]{6}$/i;
const DEFAULT_ACCENT = '#cdb074';

export default function ThemeStyle({ theme }) {
  if (!theme) return null;
  const vars = [];
  if (HEX.test(theme.primary || '')) vars.push(`--color-emerald-deep:${theme.primary}`);
  if (HEX.test(theme.secondary || '')) vars.push(`--color-emerald-mid:${theme.secondary}`);
  if (HEX.test(theme.accent || '')) {
    vars.push(`--color-gold:${theme.accent}`);
    // The hand-tuned light/dark golds stay unless the accent itself changes.
    if (theme.accent.toLowerCase() !== DEFAULT_ACCENT) {
      vars.push(`--color-gold-light:color-mix(in srgb,${theme.accent} 62%,white)`);
      vars.push(`--color-gold-dark:color-mix(in srgb,${theme.accent} 72%,black)`);
    }
  }
  if (!vars.length) return null;
  return <style dangerouslySetInnerHTML={{ __html: `:root{${vars.join(';')}}` }} />;
}
