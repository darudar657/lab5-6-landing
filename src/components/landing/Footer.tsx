import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../LogoIcon';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const COLUMNS = [
  {
    titleKey: 'footer.product',
    links: [
      { key: 'footer.accounts' },
      { key: 'footer.cards' },
      { key: 'footer.transfers' },
      { key: 'nav.savings' },
      { key: 'footer.exchange' },
    ],
  },
  {
    titleKey: 'footer.company',
    links: [
      { key: 'footer.about' },
      { key: 'footer.careers' },
      { key: 'footer.press' },
      { key: 'footer.investors' },
      { key: 'footer.contact' },
    ],
  },
  {
    titleKey: 'footer.legal',
    links: [
      { key: 'footer.privacy' },
      { key: 'footer.terms' },
      { key: 'footer.cookies' },
      { key: 'footer.licenses' },
      { key: 'footer.disclosures' },
    ],
  },
  {
    titleKey: 'footer.connect',
    links: [
      { key: 'footer.helpCenter' },
      { key: 'footer.status' },
      { key: 'footer.twitter' },
      { key: 'footer.linkedIn' },
      { key: 'footer.youTube' },
    ],
  },
];

export function Footer() {
  const { t } = useTranslation();

  function scrollToTop(e: MouseEvent) {
    e.preventDefault();
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4, force: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleLinkClick(e: MouseEvent) {
    e.preventDefault();
    const JOKES_COUNT = 6;
    const idx = Math.floor(Math.random() * JOKES_COUNT);
    toast((tItem) => (
      <div className="flex items-center gap-3">
        <span>{t(`footer.jokes.${idx}`)}</span>
        <button
          onClick={() => toast.dismiss(tItem.id)}
          className="p-1.5 -mr-1.5 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ), { duration: 5000 });
  }

  return (
    <footer id="footer" className="bg-[#F5F5F5] px-6 pt-20 pb-10 border-t border-black/5">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-1">
            <a href="/" onClick={scrollToTop} className="flex items-center gap-2 mb-4 cursor-pointer">
              <LogoIcon className="w-7 h-7 text-black" />
              <span className="text-xl font-medium tracking-tight text-black">Halo Bank</span>
            </a>
            <p className="text-sm text-black/60 max-w-xs">
              {t('footer.desc')}
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <div className="text-xs uppercase tracking-wider text-black/40 mb-4">
                {t(col.titleKey)}
              </div>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <a
                      href="#"
                      onClick={handleLinkClick}
                      className="text-sm text-black/70 hover:text-black transition-colors"
                    >
                      {t(link.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-black/5">
          <div className="text-xs text-black/40">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
          <div className="text-xs text-black/40">
            {t('footer.tagline')}
          </div>
        </div>
      </div>
    </footer>
  );
}
