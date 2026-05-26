import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDownUp, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBank } from '../../bank/BankContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { convert, formatMoney } from '../../bank/format';

export default function ExchangePage() {
  const { accounts, exchange } = useBank();
  const { t } = useTranslation();
  const [fromId, setFromId] = useState(accounts[0]?.id ?? '');
  const [toId, setToId] = useState(accounts[1]?.id ?? accounts[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);

  const amountNum = parseFloat(amount);
  const previewTo = useMemo(() => {
    if (!from || !to || !isFinite(amountNum) || amountNum <= 0) return 0;
    return convert(amountNum, from.currency, to.currency);
  }, [amountNum, from, to]);

  const rate = useMemo(() => {
    if (!from || !to) return 1;
    return convert(1, from.currency, to.currency);
  }, [from, to]);

  function swap() {
    setFromId(toId);
    setToId(fromId);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!isFinite(amountNum) || amountNum <= 0) {
      setError('Invalid amount');
      return;
    }
    const result = exchange({ fromAccountId: fromId, toAccountId: toId, amountFrom: amountNum });
    if (result.ok) {
      setSuccess(
        t('exchangePage.success', {
          from: formatMoney(amountNum, from?.currency ?? 'USD'),
          to: formatMoney(result.amountTo, to?.currency ?? 'USD'),
        })
      );
      setAmount('');
    } else {
      setError(result.error);
    }
  }

  return (
    <div>
      <PageHeader title={t('exchangePage.title')} subtitle={t('exchangePage.subtitle')} />

      <div className="bg-white rounded-2xl border border-black/5 p-8 max-w-3xl">
        <form onSubmit={submit} className="space-y-4">
          <div className="bg-black/[0.03] rounded-2xl p-5">
            <div className="text-xs text-black/50 mb-2">{t('exchangePage.youSend')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={fromId} onChange={(e) => setFromId(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {formatMoney(a.balance, a.currency)}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swap}
              className="w-10 h-10 rounded-full bg-white border border-black/10 hover:border-black/30 flex items-center justify-center transition-colors"
              aria-label="Swap currencies"
            >
              <ArrowDownUp className="w-4 h-4 text-black" />
            </button>
          </div>

          <div className="bg-black/[0.03] rounded-2xl p-5">
            <div className="text-xs text-black/50 mb-2">{t('exchangePage.youReceive')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={toId} onChange={(e) => setToId(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.currency}
                  </option>
                ))}
              </Select>
              <div className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-base text-black/70">
                {to ? formatMoney(previewTo, to.currency) : '-'}
              </div>
            </div>
          </div>

          <div className="text-sm text-black/60">
            {t('exchangePage.rate')}: 1 {from?.currency ?? '-'} = {rate.toFixed(4)} {to?.currency ?? '-'}
          </div>

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Button type="submit" size="lg">
            {t('exchangePage.convert')}
          </Button>
        </form>
      </div>
    </div>
  );
}
