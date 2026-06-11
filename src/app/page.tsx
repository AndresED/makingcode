import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t(locale, 'home.title')}
        </h1>
        <p className="max-w-2xl text-lg text-ink-muted">{t(locale, 'home.subtitle')}</p>
      </div>
      <div className="rounded-xl border border-white/8 bg-dark-800/60 px-6 py-10 text-center">
        <p className="text-ink-muted">{t(locale, 'home.empty')}</p>
      </div>
    </section>
  );
}
