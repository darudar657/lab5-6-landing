import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBank } from '../../bank/BankContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { TransactionRow } from '../../components/ui/TransactionRow';
import type { TxCategory } from '../../bank/types';

const CATEGORIES: (TxCategory | 'all')[] = [
  'all',
  'groceries',
  'salary',
  'utilities',
  'entertainment',
  'transport',
  'food',
  'subscription',
  'transfer',
  'other',
];

const RANGES = [
  { key: 'last7', days: 7 },
  { key: 'last30', days: 30 },
  { key: 'last90', days: 90 },
  { key: 'allTime', days: 0 },
];

export default function TransactionsPage() {
  const { transactions, accounts } = useBank();
  const { t } = useTranslation();
  const [range, setRange] = useState(30);
  const [category, setCategory] = useState<TxCategory | 'all'>('all');
  const [accountId, setAccountId] = useState<'all' | string>('all');
  const [direction, setDirection] = useState<'all' | 'in' | 'out'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const cutoff = range === 0 ? 0 : Date.now() - range * 24 * 60 * 60 * 1000;
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (range !== 0 && new Date(tx.date).getTime() < cutoff) return false;
      if (category !== 'all' && tx.category !== category) return false;
      if (accountId !== 'all' && tx.accountId !== accountId) return false;
      if (direction === 'in' && tx.amount < 0) return false;
      if (direction === 'out' && tx.amount > 0) return false;
      if (q && !tx.merchant.toLowerCase().includes(q) && !tx.description?.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [transactions, range, category, accountId, direction, query]);

  function exportCsv() {
    const headers = ['Date', 'Merchant', 'Category', 'Account', 'Amount', 'Currency', 'Status'];
    const rows = filtered.map((tx) => {
      const acc = accounts.find((a) => a.id === tx.accountId);
      return [
        tx.date,
        tx.merchant,
        tx.category,
        acc?.name ?? '',
        tx.amount.toFixed(2),
        tx.currency,
        tx.status,
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title={t('transactionsPage.title')}
        subtitle={t('transactionsPage.subtitle')}
        actions={
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-black/5 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <span className="block text-sm text-black/60 mb-1.5">{t('transactionsPage.search')}</span>
            <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl px-4 py-2.5 focus-within:border-black/40 transition-colors">
              <Search className="w-4 h-4 text-black/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('transactionsPage.searchPlaceholder')}
                className="flex-1 bg-transparent outline-none text-sm text-black placeholder-black/40"
              />
            </div>
          </div>
          <Select label={t('transactionsPage.range')} value={range} onChange={(e) => setRange(Number(e.target.value))}>
            {RANGES.map((r) => (
              <option key={r.days} value={r.days}>
                {t(`transactionsPage.${r.key}`)}
              </option>
            ))}
          </Select>
          <Select
            label={t('transactionsPage.category')}
            value={category}
            onChange={(e) => setCategory(e.target.value as TxCategory | 'all')}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? t('transactionsPage.allCategories') : t(`categories.${c}`)}
              </option>
            ))}
          </Select>
          <Select label={t('transactionsPage.account')} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="all">{t('transactionsPage.allAccounts')}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2 mt-4">
          {(['all', 'in', 'out'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                direction === d ? 'bg-black text-white' : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
            >
              {d === 'all' ? t('transactionsPage.all') : d === 'in' ? t('transactionsPage.income') : t('transactionsPage.expense')}
            </button>
          ))}
          <div className="ml-auto text-sm text-black/50 self-center">
            {filtered.length} {filtered.length === 1 ? t('transactionsPage.results') : t('transactionsPage.resultsPlural')}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-black/5">
        <div className="divide-y divide-black/5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-black/50">{t('transactionsPage.noTx')}</div>
          ) : (
            filtered.map((tx) => {
              const accName = accounts.find((a) => a.id === tx.accountId)?.name;
              return <TransactionRow key={tx.id} tx={tx} accountName={accName} />;
            })
          )}
        </div>
      </div>
    </div>
  );
}
