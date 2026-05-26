import { Bell, LogOut, Search, Sparkles, TrendingUp, Coffee, Zap, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../bank/AuthContext';

const FUN_NOTIFICATIONS = [
  {
    icon: Sparkles,
    titleKey: 'notifications.funFact',
    textKey: 'notifications.funFactDesc',
    timeKey: 'notifications.minAgo',
    timeCount: 2,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: TrendingUp,
    titleKey: 'notifications.marketInsight',
    textKey: 'notifications.marketInsightDesc',
    timeKey: 'notifications.minAgo',
    timeCount: 15,
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: Coffee,
    titleKey: 'notifications.dailyTip',
    textKey: 'notifications.dailyTipDesc',
    timeKey: 'notifications.hrAgo',
    timeCount: 1,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Zap,
    titleKey: 'notifications.didYouKnow',
    textKey: 'notifications.didYouKnowDesc',
    timeKey: 'notifications.hrsAgo',
    timeCount: 3,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Heart,
    titleKey: 'notifications.haloCares',
    textKey: 'notifications.haloCaresDesc',
    timeKey: 'notifications.hrsAgo',
    timeCount: 5,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
  },
];

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellOpen && bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setBellOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [bellOpen, menuOpen]);

  function toggleBell() {
    setBellOpen((v) => !v);
    setMenuOpen(false);
    if (!bellOpen) setHasUnread(false);
  }

  function toggleMenu() {
    setMenuOpen((v) => !v);
    setBellOpen(false);
  }



  return (
    <div className="h-16 border-b border-black/5 bg-white flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-2 bg-black/[0.04] rounded-full px-4 py-2 w-80 max-w-md">
        <Search className="w-4 h-4 text-black/40" />
        <input
          type="text"
          placeholder={t('topbar.search')}
          className="bg-transparent outline-none text-sm flex-1 text-black placeholder-black/40"
        />
      </div>

      <div className="flex items-center gap-3">        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={toggleBell}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative ${
              bellOpen ? 'bg-black/10' : 'hover:bg-black/5'
            }`}
            aria-label={t('topbar.notifications')}
          >
            <Bell className={`w-5 h-5 transition-colors ${bellOpen ? 'text-black' : 'text-black/70'}`} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-12 z-20 w-96 bg-white rounded-2xl border border-black/10 shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <div className="text-base font-semibold text-black">{t('topbar.notifications')}</div>
                <span className="text-xs text-black/40 bg-black/[0.04] px-2.5 py-1 rounded-full">
                  {t('topbar.new', { count: FUN_NOTIFICATIONS.length })}
                </span>
              </div>
              <div
                className="max-h-96 overflow-y-auto"
                data-lenis-prevent
              >
                {FUN_NOTIFICATIONS.map((notif, i) => (
                  <div
                    key={i}
                    className="px-5 py-4 hover:bg-black/[0.02] transition-colors border-b border-black/5 last:border-0 cursor-default"
                  >
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-xl ${notif.bg} ${notif.color} flex items-center justify-center shrink-0`}>
                        <notif.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium text-black">{t(notif.titleKey)}</span>
                          <span className="text-xs text-black/40">{t(notif.timeKey, { count: notif.timeCount })}</span>
                        </div>
                        <p className="text-sm text-black/60 leading-relaxed">{t(notif.textKey)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-black/5 bg-black/[0.02]">
                <p className="text-xs text-black/40 text-center">{t('topbar.allDone')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={toggleMenu}
            className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-black/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#2B2644] text-white flex items-center justify-center text-sm font-medium">
              {initials || '?'}
            </div>
            <span className="hidden md:block text-sm font-medium text-black">
              {user?.firstName}
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 z-20 w-56 bg-white rounded-xl border border-black/10 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-black/5">
                <div className="text-sm font-medium text-black">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-black/50">{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-black hover:bg-black/5 text-left"
              >
                <LogOut className="w-4 h-4" />
                {t('topbar.logOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
