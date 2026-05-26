import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../LogoIcon';
import { useAuth } from '../../bank/AuthContext';

const NAV_LINKS = [
  { key: 'personal', href: '#features' },
  { key: 'business', href: '#use-cases' },
  { key: 'cards', href: '#cards' },
  { key: 'savings', href: '#savings' },
  { key: 'help', href: '#footer' },
] as const;

const NAVBAR_HEIGHT = 80;

export function Navbar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop(e: React.MouseEvent) {
    e.preventDefault();
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2, force: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;

    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: -NAVBAR_HEIGHT, duration: 1.2, force: true });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }


  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F5F5F5]/80 backdrop-blur-md border-b border-black/5'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="w-full flex items-center justify-between relative">
        <div className="flex-1 flex justify-start">
          <a href="/" onClick={scrollToTop} className="flex items-center gap-2">
            <LogoIcon className="w-7 h-7 text-black" />
            <span className="text-2xl font-medium tracking-tight text-black">Halo Bank</span>
          </a>
        </div>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pt-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200 cursor-pointer"
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-end gap-3">
          {user ? (
            <div className="flex items-center gap-4 ml-2">
              <span className="hidden sm:inline text-sm font-medium text-black/70">
                {t('dashboard.greeting', { name: user.firstName })}
              </span>
              <Link
                to="/app/dashboard"
                className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200"
              >
                {t('nav.openWallet')}
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-block text-base text-gray-700 hover:text-black font-medium transition-colors duration-200"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/register"
                className="bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200"
              >
                {t('nav.openAccount')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
