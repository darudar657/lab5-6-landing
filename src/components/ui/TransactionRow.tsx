import {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  Car,
  Coffee,
  Film,
  Repeat,
  ShoppingBag,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Transaction, TxCategory } from '../../bank/types';
import { formatDateTime, formatMoney } from '../../bank/format';

const CATEGORY_ICON: Record<TxCategory, typeof ShoppingBag> = {
  groceries: ShoppingBag,
  salary: Briefcase,
  utilities: Zap,
  entertainment: Film,
  transport: Car,
  food: Coffee,
  subscription: Wifi,
  transfer: Repeat,
  other: Sparkles,
};

interface TransactionRowProps {
  tx: Transaction;
  accountName?: string;
}

export function TransactionRow({ tx, accountName }: TransactionRowProps) {
  const { t } = useTranslation();
  const Icon = CATEGORY_ICON[tx.category];
  const isIncoming = tx.amount > 0;
  return (
    <div className="flex items-center gap-4 py-3 px-2 hover:bg-black/[0.02] rounded-xl transition-colors">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isIncoming ? 'bg-green-100 text-green-700' : 'bg-black/5 text-black/70'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-black truncate">{tx.merchant}</div>
        <div className="text-xs text-black/50 truncate">
          {formatDateTime(tx.date)}
          {accountName ? ` · ${accountName}` : ''}
          {tx.description ? ` · ${tx.description}` : ''}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div
          className={`text-sm font-medium ${isIncoming ? 'text-green-600' : 'text-black'} flex items-center gap-1 justify-end`}
        >
          {isIncoming ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
          {formatMoney(tx.amount, tx.currency)}
        </div>
        <div className="text-xs text-black/40 capitalize">{t(`categories.${tx.category}`)}</div>
      </div>
    </div>
  );
}
