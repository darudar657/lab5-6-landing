import { useTranslation } from 'react-i18next';

const STATS = [
  { value: '2.4M', labelKey: 'stats.customers' },
  { value: '180', labelKey: 'stats.countries' },
  { value: '$48B', labelKey: 'stats.volume' },
  { value: '8.5%', labelKey: 'stats.apy' },
];

export function StatsSection() {
  const { t } = useTranslation();
  return (
    <section id="savings" className="bg-[#F5F5F5] px-6 py-20">
      <div className="w-full bg-[#2B2644] rounded-2xl p-10 md:p-16 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -left-12 -bottom-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="relative">
          <h2
            className="text-white text-4xl md:text-5xl font-medium leading-tight mb-3 max-w-3xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t('stats.heading')}
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mb-12">
            {t('stats.subtitle')}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.labelKey}>
                <div
                  className="text-white text-5xl md:text-6xl font-medium leading-none"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  {s.value}
                </div>
                <div className="text-white/60 text-sm mt-3">{t(s.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
