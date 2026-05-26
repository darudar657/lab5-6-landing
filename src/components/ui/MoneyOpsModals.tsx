import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBank } from '../../bank/BankContext';
import { formatMoney } from '../../bank/format';
import { Modal } from './Modal';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';

type TopUpSource = 'bank_transfer' | 'card' | 'cash' | 'salary';
type WithdrawMethod = 'atm' | 'bank_transfer' | 'cash';

interface MoneyOpsModalsProps {
  topUpOpen: boolean;
  withdrawOpen: boolean;
  onClose: () => void;
  defaultAccountId?: string;
}

export function MoneyOpsModals({
  topUpOpen,
  withdrawOpen,
  onClose,
  defaultAccountId,
}: MoneyOpsModalsProps) {
  const { accounts, topUp, withdraw } = useBank();
  const { t } = useTranslation();

  const [topUpForm, setTopUpForm] = useState<{
    accountId: string;
    amount: string;
    source: TopUpSource;
    note: string;
  }>({
    accountId: defaultAccountId ?? accounts[0]?.id ?? '',
    amount: '',
    source: 'bank_transfer',
    note: '',
  });

  const [withdrawForm, setWithdrawForm] = useState<{
    accountId: string;
    amount: string;
    method: WithdrawMethod;
    note: string;
  }>({
    accountId: defaultAccountId ?? accounts[0]?.id ?? '',
    amount: '',
    method: 'atm',
    note: '',
  });

  useEffect(() => {
    if (defaultAccountId) {
      setTopUpForm((f) => ({ ...f, accountId: defaultAccountId }));
      setWithdrawForm((f) => ({ ...f, accountId: defaultAccountId }));
    }
  }, [defaultAccountId]);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setSuccess(null);
    setError(null);
  }

  function submitTopUp(e: FormEvent) {
    e.preventDefault();
    reset();
    const amount = parseFloat(topUpForm.amount);
    if (!isFinite(amount) || amount <= 0) {
      setError(t('transfersPage.invalidAmount'));
      return;
    }
    const result = topUp({
      accountId: topUpForm.accountId,
      amount,
      source: topUpForm.source,
      note: topUpForm.note || undefined,
    });
    if (result.ok) {
      const acc = accounts.find((a) => a.id === topUpForm.accountId);
      setSuccess(
        `Added ${formatMoney(amount, acc?.currency ?? 'USD')} to ${acc?.name ?? 'account'}`,
      );
      setTopUpForm((f) => ({ ...f, amount: '', note: '' }));
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1200);
    } else {
      setError(result.error);
    }
  }

  function submitWithdraw(e: FormEvent) {
    e.preventDefault();
    reset();
    const amount = parseFloat(withdrawForm.amount);
    if (!isFinite(amount) || amount <= 0) {
      setError(t('transfersPage.invalidAmount'));
      return;
    }
    const result = withdraw({
      accountId: withdrawForm.accountId,
      amount,
      method: withdrawForm.method,
      note: withdrawForm.note || undefined,
    });
    if (result.ok) {
      const acc = accounts.find((a) => a.id === withdrawForm.accountId);
      setSuccess(
        `Withdrew ${formatMoney(amount, acc?.currency ?? 'USD')} from ${acc?.name ?? 'account'}`,
      );
      setWithdrawForm((f) => ({ ...f, amount: '', note: '' }));
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1200);
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <Modal open={topUpOpen} onClose={onClose} title={t('moneyOps.topUp')}>
        <form onSubmit={submitTopUp} className="space-y-4">
          <Select
            label={t('moneyOps.toAccount')}
            value={topUpForm.accountId}
            onChange={(e) => setTopUpForm((f) => ({ ...f, accountId: e.target.value }))}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {formatMoney(a.balance, a.currency)}
              </option>
            ))}
          </Select>
          <Input
            label={t('moneyOps.amount')}
            type="number"
            min="0"
            step="0.01"
            value={topUpForm.amount}
            onChange={(e) => setTopUpForm((f) => ({ ...f, amount: e.target.value }))}
            required
            placeholder="0.00"
            autoFocus
          />
          <Select
            label="Source"
            value={topUpForm.source}
            onChange={(e) =>
              setTopUpForm((f) => ({ ...f, source: e.target.value as TopUpSource }))
            }
          >
            <option value="bank_transfer">Bank transfer</option>
            <option value="card">From another card</option>
            <option value="cash">Cash deposit</option>
            <option value="salary">Salary</option>
          </Select>
          <Input
            label={t('transfersPage.descriptionOptional')}
            value={topUpForm.note}
            onChange={(e) => setTopUpForm((f) => ({ ...f, note: e.target.value }))}
          />
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
          <Button type="submit" className="w-full">
            <ArrowDownToLine className="w-4 h-4" />
            {t('moneyOps.topUp')}
          </Button>
        </form>
      </Modal>

      <Modal open={withdrawOpen} onClose={onClose} title={t('moneyOps.withdraw')}>
        <form onSubmit={submitWithdraw} className="space-y-4">
          <Select
            label={t('moneyOps.fromAccount')}
            value={withdrawForm.accountId}
            onChange={(e) => setWithdrawForm((f) => ({ ...f, accountId: e.target.value }))}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {formatMoney(a.balance, a.currency)}
              </option>
            ))}
          </Select>
          <Input
            label={t('moneyOps.amount')}
            type="number"
            min="0"
            step="0.01"
            value={withdrawForm.amount}
            onChange={(e) => setWithdrawForm((f) => ({ ...f, amount: e.target.value }))}
            required
            placeholder="0.00"
            autoFocus
          />
          <Select
            label="Method"
            value={withdrawForm.method}
            onChange={(e) =>
              setWithdrawForm((f) => ({ ...f, method: e.target.value as WithdrawMethod }))
            }
          >
            <option value="atm">ATM</option>
            <option value="bank_transfer">Bank transfer out</option>
            <option value="cash">Cash withdrawal</option>
          </Select>
          <Input
            label={t('transfersPage.descriptionOptional')}
            value={withdrawForm.note}
            onChange={(e) => setWithdrawForm((f) => ({ ...f, note: e.target.value }))}
          />
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
          <Button type="submit" className="w-full">
            <ArrowUpFromLine className="w-4 h-4" />
            {t('moneyOps.withdraw')}
          </Button>
        </form>
      </Modal>
    </>
  );
}
