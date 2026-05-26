import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useBank } from '../../bank/BankContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { apyForTerm, convert, formatDate, formatMoney } from '../../bank/format';

export default function SavingsPage() {
  const { deposits, accounts, openDeposit, closeDeposit } = useBank();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    accountId: accounts[0]?.id ?? '',
    principal: '',
    termDays: 90,
  });
  const [error, setError] = useState<string | null>(null);

  const TERMS = [
    { label: t('savingsPage.flexible'), days: 0 },
    { label: t('savingsPage.months', { count: 1 }), days: 30 },
    { label: t('savingsPage.months', { count: 3 }), days: 90 },
    { label: t('savingsPage.months', { count: 6 }), days: 180 },
    { label: t('savingsPage.months', { count: 12 }), days: 365 },
  ];

  const active = deposits.filter((d) => d.status === 'active');
  const totalPrincipalUsd = useMemo(
    () => active.reduce((s, d) => s + convert(d.principal, d.currency, 'USD'), 0),
    [active],
  );
  const totalAccruedUsd = useMemo(
    () => active.reduce((s, d) => s + convert(d.accruedInterest, d.currency, 'USD'), 0),
    [active],
  );

  const apyPreview = apyForTerm(form.termDays);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const principal = parseFloat(form.principal);
    if (!isFinite(principal) || principal <= 0) {
      setError('Invalid amount');
      return;
    }
    const result = openDeposit({
      accountId: form.accountId,
      principal,
      termDays: form.termDays,
    });
    if (result.ok) {
      setOpen(false);
      setForm((f) => ({ ...f, principal: '' }));
    } else {
      setError(result.error);
    }
  }

  return (
    <div>
      <PageHeader
        title={t('savingsPage.title')}
        subtitle={t('savingsPage.subtitle')}
        actions={
          <Button onClick={() => setOpen(true)} disabled={accounts.length === 0}>
            {t('savingsPage.openDeposit')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#2B2644] rounded-2xl p-8 text-white">
          <div className="text-sm text-white/60 mb-2">{t('savingsPage.totalInDeposits')}</div>
          <div
            className="text-4xl md:text-5xl font-medium leading-none"
            style={{ letterSpacing: '-0.03em' }}
          >
            {formatMoney(totalPrincipalUsd, 'USD')}
          </div>
          <div className="text-sm text-white/60 mt-4">
            {t('savingsPage.accruedInterest')}{' '}
            <span className="text-green-300 font-medium">{formatMoney(totalAccruedUsd, 'USD')}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-black/5">
          <div className="text-sm text-black/60 mb-2">{t('savingsPage.ratesToday')}</div>
          <div className="space-y-2 mt-4">
            {TERMS.map((term) => (
              <div key={term.days} className="flex items-center justify-between">
                <span className="text-sm text-black/70">{term.label}</span>
                <span
                  className="text-base font-medium text-black"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {(apyForTerm(term.days) * 100).toFixed(2)}% APY
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-black/5">
        <div className="text-2xl font-medium text-black mb-4" style={{ letterSpacing: '-0.02em' }}>
          {t('savingsPage.activeDeposits')}
        </div>
        {active.length === 0 ? (
          <div className="py-8 text-center text-black/50">
            {t('savingsPage.noDeposits')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((d) => {
              const acc = accounts.find((a) => a.id === d.accountId);
              const elapsed = (Date.now() - new Date(d.startDate).getTime()) / (1000 * 60 * 60 * 24);
              const remaining =
                d.termDays === 0 ? null : Math.max(0, Math.ceil(d.termDays - elapsed));
              return (
                <div key={d.id} className="border border-black/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-black/50 uppercase tracking-wider">
                      {d.termDays === 0 ? t('savingsPage.flexible') : t('savingsPage.dayTerm', { days: d.termDays })}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                      {(d.apy * 100).toFixed(2)}% APY
                    </span>
                  </div>
                  <div
                    className="text-2xl font-medium text-black mb-1"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {formatMoney(d.principal, d.currency)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    + {formatMoney(d.accruedInterest, d.currency)} {t('savingsPage.earned')}
                  </div>
                  <div className="text-xs text-black/50 mt-4">
                    {t('savingsPage.from')} {acc?.name ?? '-'} · {t('savingsPage.started')} {formatDate(d.startDate)}
                  </div>
                  {remaining !== null && (
                    <div className="text-xs text-black/50">
                      {remaining > 0 ? t('savingsPage.daysLeft', { days: remaining }) : t('savingsPage.matured')}
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => closeDeposit(d.id)}
                  >
                    {t('savingsPage.withdraw')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t('savingsPage.newDeposit')}>
        <form onSubmit={submit} className="space-y-4">
          <Select
            label={t('savingsPage.sourceAccount')}
            value={form.accountId}
            onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {formatMoney(a.balance, a.currency)}
              </option>
            ))}
          </Select>
          <Input
            label={t('savingsPage.amount')}
            type="number"
            min="0"
            step="0.01"
            value={form.principal}
            onChange={(e) => setForm((f) => ({ ...f, principal: e.target.value }))}
            required
          />
          <Select
            label={t('savingsPage.period')}
            value={form.termDays}
            onChange={(e) => setForm((f) => ({ ...f, termDays: Number(e.target.value) }))}
          >
            {TERMS.map((term) => (
              <option key={term.days} value={term.days}>
                {term.label}
              </option>
            ))}
          </Select>
          <div className="bg-black/[0.03] rounded-xl p-3 text-sm text-black/70">
            {t('savingsPage.apy', { rate: (apyPreview * 100).toFixed(2) })}
          </div>
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full">
            {t('savingsPage.open')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
