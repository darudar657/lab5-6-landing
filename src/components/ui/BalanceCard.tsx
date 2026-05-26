import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Account } from '../../bank/types';
import { convert, formatMoney } from '../../bank/format';

interface BalanceCardProps {
  accounts: Account[];
  monthChangePct?: number;
}

export function BalanceCard({ accounts, monthChangePct = 4.2 }: BalanceCardProps) {
  const { t } = useTranslation();
  const totalUsd = accounts.reduce((sum, a) => sum + convert(a.balance, a.currency, 'USD'), 0);
  return (
    <div className="bg-[#2B2644] rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute -right-24 top-20 w-40 h-40 rounded-full bg-white/5" />
      <div className="relative">
        <div className="text-sm text-white/60 mb-2">{t('balanceCard.totalBalance')}</div>
        <div
          className="text-5xl md:text-6xl font-medium leading-none"
          style={{ letterSpacing: '-0.04em' }}
        >
          {formatMoney(totalUsd, 'USD')}
        </div>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span className="inline-flex items-center gap-1 bg-green-400/20 text-green-300 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />+{monthChangePct.toFixed(1)}%
          </span>
          <span className="text-white/50">{t('balanceCard.vsLastMonth')}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
          {accounts.slice(0, 3).map((a) => (
            <div key={a.id} className="bg-white/5 rounded-xl px-4 py-3">
              <div className="text-xs text-white/60">{a.name}</div>
              <div className="text-base font-medium mt-1">{formatMoney(a.balance, a.currency)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
