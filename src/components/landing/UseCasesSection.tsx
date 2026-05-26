import { ArrowRight, Building2, User, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const USE_CASES = [
  { icon: User, titleKey: 'useCases.personal', bodyKey: 'useCases.personalDesc' },
  { icon: Building2, titleKey: 'useCases.business', bodyKey: 'useCases.businessDesc' },
  { icon: Wallet, titleKey: 'useCases.treasury', bodyKey: 'useCases.treasuryDesc' },
];

export function UseCasesSection() {
  const { t } = useTranslation();
  return (
    <section id="use-cases" className="bg-[#F5F5F5] px-6 py-24">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="md:pr-12 md:pt-2">
          <p className="text-black/60 text-sm mb-2">{t('useCases.label')}</p>
          <h2
            className="text-black text-5xl md:text-6xl font-medium leading-none mb-6"
            style={{ letterSpacing: '-0.04em' }}
          >
            {t('useCases.heading')}
          </h2>
          <p className="text-black/60 text-base leading-relaxed max-w-sm mb-10">
            {t('useCases.subtitle')}
          </p>

          <div className="space-y-3">
            {USE_CASES.map((uc) => (
              <div
                key={uc.titleKey}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-black/5"
              >
                <div className="w-10 h-10 rounded-full bg-[#2B2644] text-white flex items-center justify-center shrink-0">
                  <uc.icon className="w-4 h-4" />
                </div>
                <div>
                  <div
                    className="text-lg font-medium text-black"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {t(uc.titleKey)}
                  </div>
                  <div className="text-sm text-black/60 mt-1">{t(uc.bodyKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden min-h-[720px]">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover absolute inset-0 w-full h-full"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
          />
          <div className="relative z-10 p-10 md:p-12">
            <h3
              className="text-black text-4xl md:text-5xl font-medium leading-tight mb-5"
              style={{ letterSpacing: '-0.03em' }}
            >
              {t('useCases.openTitle')}
            </h3>
            <p className="text-black/70 text-base max-w-md mb-8">
              {t('useCases.openDesc')}
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 text-black text-base font-medium"
            >
              <span className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors">
                <ArrowRight className="w-4 h-4 text-black" />
              </span>
              {t('useCases.getStarted')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
