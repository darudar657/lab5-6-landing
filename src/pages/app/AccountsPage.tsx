import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBank } from '../../bank/BankContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatIban, formatMoney } from '../../bank/format';
import type { AccountType, Currency } from '../../bank/types';

export default function AccountsPage() {
  const { accounts, createAccount } = useBank();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; type: AccountType; currency: Currency }>({
    name: '',
    type: 'checking',
    currency: 'USD',
  });

  const TYPE_LABEL: Record<AccountType, string> = {
    checking: t('accountsPage.checking'),
    savings: t('accountsPage.savings'),
    halo: t('accountsPage.haloWallet'),
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createAccount(form);
    setForm({ name: '', type: 'checking', currency: 'USD' });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title={t('accountsPage.title')}
        subtitle={t('accountsPage.subtitle')}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('accountsPage.newAccount')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((a) => (
          <Link
            key={a.id}
            to={`/app/accounts/${a.id}`}
            className="bg-white rounded-2xl p-6 border border-black/5 hover:border-black/20 transition-colors block"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-black/50 uppercase tracking-wider">
                  {TYPE_LABEL[a.type]}
                </div>
                <div className="text-lg font-medium text-black mt-1">{a.name}</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/5 text-black/60 font-medium">
                {a.currency}
              </span>
            </div>
            <div
              className="text-3xl font-medium text-black mb-2"
              style={{ letterSpacing: '-0.03em' }}
            >
              {formatMoney(a.balance, a.currency)}
            </div>
            <div className="text-xs text-black/50 font-mono mt-4">{formatIban(a.iban)}</div>
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-transparent rounded-2xl p-6 border-2 border-dashed border-black/10 hover:border-black/30 transition-colors flex flex-col items-center justify-center min-h-[180px] text-black/50 hover:text-black"
        >
          <Plus className="w-6 h-6 mb-2" />
          <span className="text-sm font-medium">{t('accountsPage.openNew')}</span>
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t('accountsPage.openNew')}>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label={t('accountsPage.accountName')}
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="My EUR savings"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('accountsPage.type')}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
            >
              <option value="checking">{t('accountsPage.checking')}</option>
              <option value="savings">{t('accountsPage.savings')}</option>
              <option value="halo">{t('accountsPage.haloWallet')}</option>
            </Select>
            <Select
              label={t('accountsPage.currency')}
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as Currency }))}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UAH">UAH</option>
              <option value="USDH">USD Halo</option>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            {t('accountsPage.create')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
