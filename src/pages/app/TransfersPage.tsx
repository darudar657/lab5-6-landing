import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBank } from '../../bank/BankContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { convert, formatMoney } from '../../bank/format';

type Tab = 'internal' | 'external' | 'card';

export default function TransfersPage() {
  const { accounts, transactions, internalTransfer, externalTransfer } = useBank();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('internal');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [internalForm, setInternalForm] = useState({
    fromAccountId: accounts[0]?.id ?? '',
    toAccountId: accounts[1]?.id ?? accounts[0]?.id ?? '',
    amount: '',
    description: '',
  });

  const [externalForm, setExternalForm] = useState({
    fromAccountId: accounts[0]?.id ?? '',
    counterpartyName: '',
    counterpartyIban: '',
    amount: '',
    description: '',
  });

  const [cardForm, setCardForm] = useState({
    fromAccountId: accounts[0]?.id ?? '',
    counterpartyName: '',
    cardNumber: '',
    amount: '',
    description: '',
  });

  const transferTxs = useMemo(
    () => transactions.filter((tx) => tx.category === 'transfer').slice(0, 10),
    [transactions],
  );

  function handleInternal(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const amount = parseFloat(internalForm.amount);
    if (!isFinite(amount)) {
      setError(t('transfersPage.invalidAmount'));
      return;
    }
    const result = internalTransfer({
      fromAccountId: internalForm.fromAccountId,
      toAccountId: internalForm.toAccountId,
      amountFrom: amount,
      description: internalForm.description || undefined,
    });
    if (result.ok) {
      const from = accounts.find((a) => a.id === internalForm.fromAccountId);
      const to = accounts.find((a) => a.id === internalForm.toAccountId);
      const dest = to && from ? convert(amount, from.currency, to.currency) : amount;
      setSuccessMsg(
        `Sent ${formatMoney(amount, from?.currency ?? 'USD')} → ${formatMoney(dest, to?.currency ?? 'USD')}`,
      );
      setInternalForm((f) => ({ ...f, amount: '', description: '' }));
    } else {
      setError(result.error);
    }
  }

  function handleExternal(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const amount = parseFloat(externalForm.amount);
    if (!isFinite(amount)) {
      setError(t('transfersPage.invalidAmount'));
      return;
    }
    if (!externalForm.counterpartyName.trim() || !externalForm.counterpartyIban.trim()) {
      setError(t('transfersPage.recipientRequired'));
      return;
    }
    const from = accounts.find((a) => a.id === externalForm.fromAccountId);
    const result = externalTransfer({
      fromAccountId: externalForm.fromAccountId,
      amount,
      counterparty: {
        name: externalForm.counterpartyName.trim(),
        iban: externalForm.counterpartyIban.trim(),
      },
      description: externalForm.description || undefined,
    });
    if (result.ok) {
      setSuccessMsg(
        `Sent ${formatMoney(amount, from?.currency ?? 'USD')} to ${externalForm.counterpartyName}`,
      );
      setExternalForm((f) => ({
        ...f,
        amount: '',
        counterpartyName: '',
        counterpartyIban: '',
        description: '',
      }));
    } else {
      setError(result.error);
    }
  }

  function handleCard(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const amount = parseFloat(cardForm.amount);
    if (!isFinite(amount)) {
      setError(t('transfersPage.invalidAmount'));
      return;
    }
    if (cardForm.cardNumber.replace(/\s/g, '').length < 4) {
      setError(t('transfersPage.invalidCard'));
      return;
    }
    const last4 = cardForm.cardNumber.replace(/\s/g, '').slice(-4);
    const from = accounts.find((a) => a.id === cardForm.fromAccountId);
    const result = externalTransfer({
      fromAccountId: cardForm.fromAccountId,
      amount,
      counterparty: {
        name: cardForm.counterpartyName.trim() || `Card •${last4}`,
        cardLast4: last4,
      },
      description: cardForm.description || undefined,
    });
    if (result.ok) {
      setSuccessMsg(
        `Sent ${formatMoney(amount, from?.currency ?? 'USD')} to card •${last4}`,
      );
      setCardForm((f) => ({
        ...f,
        amount: '',
        counterpartyName: '',
        cardNumber: '',
        description: '',
      }));
    } else {
      setError(result.error);
    }
  }

  return (
    <div>
      <PageHeader title={t('transfersPage.title')} subtitle={t('transfersPage.subtitle')} />

      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <div className="flex gap-2 mb-6 border-b border-black/5 pb-3">
          <TabButton active={tab === 'internal'} onClick={() => setTab('internal')}>
            {t('transfersPage.betweenAccounts')}
          </TabButton>
          <TabButton active={tab === 'external'} onClick={() => setTab('external')}>
            {t('transfersPage.toAnotherBank')}
          </TabButton>
          <TabButton active={tab === 'card'} onClick={() => setTab('card')}>
            {t('transfersPage.byCard')}
          </TabButton>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {tab === 'internal' && (
          <form onSubmit={handleInternal} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t('transfersPage.from')}
                value={internalForm.fromAccountId}
                onChange={(e) =>
                  setInternalForm((f) => ({ ...f, fromAccountId: e.target.value }))
                }
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {formatMoney(a.balance, a.currency)}
                  </option>
                ))}
              </Select>
              <Select
                label={t('transfersPage.to')}
                value={internalForm.toAccountId}
                onChange={(e) =>
                  setInternalForm((f) => ({ ...f, toAccountId: e.target.value }))
                }
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.currency}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              label={t('transfersPage.amount')}
              type="number"
              min="0"
              step="0.01"
              required
              value={internalForm.amount}
              onChange={(e) => setInternalForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
            />
            <Input
              label={t('transfersPage.descriptionOptional')}
              value={internalForm.description}
              onChange={(e) => setInternalForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Button type="submit" size="lg">
              {t('transfersPage.send')} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {tab === 'external' && (
          <form onSubmit={handleExternal} className="space-y-4 max-w-2xl">
            <Select
              label={t('transfersPage.from')}
              value={externalForm.fromAccountId}
              onChange={(e) =>
                setExternalForm((f) => ({ ...f, fromAccountId: e.target.value }))
              }
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {formatMoney(a.balance, a.currency)}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('transfersPage.recipientName')}
                required
                value={externalForm.counterpartyName}
                onChange={(e) =>
                  setExternalForm((f) => ({ ...f, counterpartyName: e.target.value }))
                }
              />
              <Input
                label={t('transfersPage.iban')}
                required
                value={externalForm.counterpartyIban}
                onChange={(e) =>
                  setExternalForm((f) => ({ ...f, counterpartyIban: e.target.value }))
                }
                placeholder="UA00 0000 0000 0000 0000 0000 00"
              />
            </div>
            <Input
              label={t('transfersPage.amount')}
              type="number"
              min="0"
              step="0.01"
              required
              value={externalForm.amount}
              onChange={(e) => setExternalForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
            />
            <Input
              label={t('transfersPage.descriptionOptional')}
              value={externalForm.description}
              onChange={(e) => setExternalForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Button type="submit" size="lg">
              {t('transfersPage.send')} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {tab === 'card' && (
          <form onSubmit={handleCard} className="space-y-4 max-w-2xl">
            <Select
              label={t('transfersPage.from')}
              value={cardForm.fromAccountId}
              onChange={(e) => setCardForm((f) => ({ ...f, fromAccountId: e.target.value }))}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {formatMoney(a.balance, a.currency)}
                </option>
              ))}
            </Select>
            <Input
              label={t('transfersPage.cardNumber')}
              required
              value={cardForm.cardNumber}
              onChange={(e) => setCardForm((f) => ({ ...f, cardNumber: e.target.value }))}
              placeholder="0000 0000 0000 0000"
            />
            <Input
              label={t('transfersPage.recipientOptional')}
              value={cardForm.counterpartyName}
              onChange={(e) =>
                setCardForm((f) => ({ ...f, counterpartyName: e.target.value }))
              }
              placeholder="John Smith"
            />
            <Input
              label={t('transfersPage.amount')}
              type="number"
              min="0"
              step="0.01"
              required
              value={cardForm.amount}
              onChange={(e) => setCardForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <Input
              label={t('transfersPage.descriptionOptional')}
              value={cardForm.description}
              onChange={(e) => setCardForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Button type="submit" size="lg">
              {t('transfersPage.send')} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-black/5">
        <div className="text-2xl font-medium text-black mb-4" style={{ letterSpacing: '-0.02em' }}>
          {t('transfersPage.recentTransfers')}
        </div>
        <div className="divide-y divide-black/5">
          {transferTxs.length === 0 ? (
            <div className="py-8 text-center text-black/50">{t('transfersPage.noTransfers')}</div>
          ) : (
            transferTxs.map((tx) => {
              const accName = accounts.find((a) => a.id === tx.accountId)?.name;
              return <TransactionRow key={tx.id} tx={tx} accountName={accName} />;
            })
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active ? 'bg-black text-white' : 'text-black/60 hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  );
}
