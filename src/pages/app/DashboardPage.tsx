import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  CreditCard,
  PiggyBank,
  Repeat,
} from 'lucide-react';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useBank } from '../../bank/BankContext';
import { useAuth } from '../../bank/AuthContext';
import { BalanceCard } from '../../components/ui/BalanceCard';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { PageHeader } from '../../components/ui/PageHeader';
import { MoneyOpsModals } from '../../components/ui/MoneyOpsModals';
import { convert, formatMoney } from '../../bank/format';
import type { TxCategory } from '../../bank/types';

const CATEGORY_COLORS: Record<TxCategory, string> = {
  groceries: '#2B2644',
  food: '#7A6FB0',
  transport: '#A8A0CC',
  entertainment: '#D9D2EF',
  subscription: '#F5B400',
  utilities: '#3CB371',
  transfer: '#94A3B8',
  salary: '#22C55E',
  other: '#E5E7EB',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { accounts, transactions } = useBank();
  const { t, i18n } = useTranslation();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const trendData = useMemo(() => {
    const days = 30;
    const data: { day: string; balance: number }[] = [];
    const totalNow = accounts.reduce((s, a) => s + convert(a.balance, a.currency, 'USD'), 0);
    let running = totalNow;
    const txsByDay = new Map<string, number>();
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      txsByDay.set(key, (txsByDay.get(key) ?? 0) + convert(t.amount, t.currency, 'USD'));
    });
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      data.push({
        day: d.toLocaleDateString(i18n.language === 'uk' ? 'uk-UA' : 'en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(running * 100) / 100,
      });
      running -= txsByDay.get(key) ?? 0;
    }
    return data.reverse();
  }, [accounts, transactions]);

  const spendingByCategory = useMemo(() => {
    const totals = new Map<TxCategory, number>();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    transactions.forEach((t) => {
      if (t.amount >= 0) return;
      if (new Date(t.date).getTime() < cutoff) return;
      const usd = Math.abs(convert(t.amount, t.currency, 'USD'));
      totals.set(t.category, (totals.get(t.category) ?? 0) + usd);
    });
    return Array.from(totals.entries())
      .map(([cat, val]) => ({ name: cat, value: Math.round(val * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const recent = transactions.slice(0, 6);

  return (
    <div>
      <PageHeader
        title={t('dashboard.greeting', { name: user?.firstName ?? '' })}
        subtitle={t('dashboard.subtitle')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <BalanceCard accounts={accounts} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/5">
          <div className="text-sm text-black/60 mb-3">{t('dashboard.quickActions')}</div>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton
              icon={ArrowDownToLine}
              label={t('dashboard.topUp')}
              onClick={() => setTopUpOpen(true)}
            />
            <QuickActionButton
              icon={ArrowUpFromLine}
              label={t('dashboard.withdraw')}
              onClick={() => setWithdrawOpen(true)}
            />
            <QuickAction to="/app/transfers" icon={ArrowLeftRight} label={t('dashboard.transfer')} />
            <QuickAction to="/app/exchange" icon={Repeat} label={t('dashboard.exchange')} />
            <QuickAction to="/app/cards" icon={CreditCard} label={t('dashboard.newCard')} />
            <QuickAction to="/app/savings" icon={PiggyBank} label={t('dashboard.openDeposit')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-black/60">{t('dashboard.balanceTrend')}</div>
              <div className="text-2xl font-medium text-black" style={{ letterSpacing: '-0.02em' }}>
                {t('dashboard.last30')}
              </div>
            </div>
          </div>
          <div className="h-64 min-w-0 min-h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#00000066' }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(trendData.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#00000066' }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => formatMoney(Number(v), 'USD')}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#2B2644"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/5">
          <div className="text-sm text-black/60 mb-1">{t('dashboard.spending')}</div>
          <div className="text-2xl font-medium text-black mb-4" style={{ letterSpacing: '-0.02em' }}>
            {t('dashboard.byCategory')}
          </div>
          <div className="h-44 min-w-0 min-h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {spendingByCategory.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as TxCategory]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => formatMoney(Number(v), 'USD')}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-4">
            {spendingByCategory.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 capitalize text-black/70">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[c.name as TxCategory] }}
                  />
                  {t(`categories.${c.name}`)}
                </span>
                <span className="text-black font-medium">{formatMoney(c.value, 'USD')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-black/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-black/60">{t('dashboard.activity')}</div>
            <div className="text-2xl font-medium text-black" style={{ letterSpacing: '-0.02em' }}>
              {t('dashboard.recentTx')}
            </div>
          </div>
          <Link to="/app/transactions" className="text-sm text-black/70 hover:text-black">
            {t('dashboard.seeAll')}
          </Link>
        </div>
        <div className="divide-y divide-black/5">
          {recent.length === 0 ? (
            <div className="py-8 text-center text-black/50">{t('dashboard.noTx')}</div>
          ) : (
            recent.map((tx) => {
              const accName = accounts.find((a) => a.id === tx.accountId)?.name;
              return <TransactionRow key={tx.id} tx={tx} accountName={accName} />;
            })
          )}
        </div>
      </div>

      <MoneyOpsModals
        topUpOpen={topUpOpen}
        withdrawOpen={withdrawOpen}
        onClose={() => {
          setTopUpOpen(false);
          setWithdrawOpen(false);
        }}
      />
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ArrowLeftRight;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-3 p-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
        <Icon className="w-4 h-4 text-black" />
      </div>
      <span className="text-sm font-medium text-black">{label}</span>
    </button>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof ArrowLeftRight;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-start gap-3 p-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
        <Icon className="w-4 h-4 text-black" />
      </div>
      <span className="text-sm font-medium text-black">{label}</span>
    </Link>
  );
}
