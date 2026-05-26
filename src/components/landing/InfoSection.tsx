import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CARD_1_BG =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85';

export function InfoSection() {
  const { t } = useTranslation();
  return (
    <section id="features" className="bg-[#F5F5F5] px-6 py-24">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          <div>
            <h2
              className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8"
              style={{ letterSpacing: '-0.03em' }}
            >
              {t('info.heading')}
            </h2>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
            >
              {t('info.cta')}
              <span className="bg-white rounded-full p-2 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-black" />
              </span>
            </Link>
          </div>
          <div>
            <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
              {t('info.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="lg:col-span-2 rounded-2xl p-7 min-h-80 flex flex-col justify-between"
            style={{
              backgroundImage: `url(${CARD_1_BG})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <h3
              className="text-black text-2xl font-medium leading-snug"
              style={{ letterSpacing: '-0.02em' }}
            >
              {t('info.multiCurrency')}
            </h3>
            <p className="text-black/70 text-base max-w-xs">
              {t('info.multiCurrencyDesc')}
            </p>
          </div>

          <div id="cards" className="rounded-2xl p-7 min-h-80 flex flex-col justify-between bg-[#2B2644]">
            <h3
              className="text-white text-2xl font-medium leading-snug"
              style={{ letterSpacing: '-0.02em' }}
            >
              {t('info.smartCards')}
              <br />
              {t('info.smartCardsLine2')}
            </h3>
            <p className="text-white/60 text-base">
              {t('info.smartCardsDesc')}
            </p>
          </div>

          <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between bg-[#2B2644]">
            <h3
              className="text-white text-2xl font-medium leading-snug"
              style={{ letterSpacing: '-0.02em' }}
            >
              {t('info.instantTransfers')}
              <br />
              {t('info.instantTransfersLine2')}
            </h3>
            <p className="text-white/60 text-base">
              {t('info.instantTransfersDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
