import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Repeat,
  Settings,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { LogoIcon } from '../LogoIcon';

const NAV_ITEMS = [
  { to: '/app/dashboard', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { to: '/app/accounts', labelKey: 'sidebar.accounts', icon: Wallet },
  { to: '/app/cards', labelKey: 'sidebar.cards', icon: CreditCard },
  { to: '/app/transfers', labelKey: 'sidebar.transfers', icon: ArrowLeftRight },
  { to: '/app/transactions', labelKey: 'sidebar.transactions', icon: Receipt },
  { to: '/app/savings', labelKey: 'sidebar.savings', icon: PiggyBank },
  { to: '/app/exchange', labelKey: 'sidebar.exchange', icon: Repeat },
];

const FOOTER_ITEMS = [
  { to: '/app/profile', labelKey: 'sidebar.profile', icon: UserIcon },
  { to: '/app/settings', labelKey: 'sidebar.settings', icon: Settings },
];

export function Sidebar() {
  const { t } = useTranslation();
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-black/5 flex flex-col h-screen sticky top-0">
      <Link to="/" className="px-6 py-6 flex items-center gap-2">
        <LogoIcon className="w-7 h-7 text-black" />
        <span className="text-xl font-medium tracking-tight text-black">Halo Bank</span>
      </Link>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
                isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-black/5">
        {FOOTER_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
                isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
