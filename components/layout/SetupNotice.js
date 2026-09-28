// Shown instead of the site when the CMS content cannot be loaded (Supabase not
// configured, unreachable, or the migration/seed has not been run yet).
// Deliberately static: it must render without any CMS data.
export default function SetupNotice() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16" dir="ltr">
      <div className="glass-strong w-full max-w-xl rounded-3xl p-8 sm:p-10">
        <p className="text-sm font-bold tracking-[0.2em] text-gold uppercase">Site setup</p>
        <h1 className="mt-3 text-2xl font-black sm:text-3xl">Content is not available yet</h1>
        <p className="mt-4 leading-relaxed text-white/70">
          The website loads all of its text and media from Supabase, and the content tables could not be read.
        </p>
        <ol className="mt-6 list-decimal space-y-2 ps-5 text-white/80">
          <li>
            Check <code className="text-gold-light">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-gold-light">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code>.
          </li>
          <li>
            Run <code className="text-gold-light">supabase/migrations/*_cms_schema.sql</code>, then{' '}
            <code className="text-gold-light">supabase/seed.sql</code>, in the Supabase SQL Editor.
          </li>
          <li>Reload this page.</li>
        </ol>
      </div>
    </main>
  );
}
