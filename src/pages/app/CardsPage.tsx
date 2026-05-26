import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, Plus, Snowflake, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBank } from '../../bank/BankContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { CardVisual } from '../../components/ui/CardVisual';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { formatMoney } from '../../bank/format';
import type { CardNetwork, CardType } from '../../bank/types';

export default function CardsPage() {
  const { cards, accounts, freezeCard, unfreezeCard, createCard, setCardLimit } = useBank();
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [issueOpen, setIssueOpen] = useState(false);
  const [limitFor, setLimitFor] = useState<string | null>(null);
  const [limitValue, setLimitValue] = useState('');

  const [form, setForm] = useState<{
    accountId: string;
    type: CardType;
    network: CardNetwork;
  }>({
    accountId: accounts[0]?.id ?? '',
    type: 'virtual',
    network: 'visa',
  });

  function submitIssue(e: FormEvent) {
    e.preventDefault();
    if (!form.accountId) return;
    createCard(form);
    setIssueOpen(false);
  }

  function submitLimit(e: FormEvent) {
    e.preventDefault();
    if (!limitFor) return;
    const value = parseFloat(limitValue);
    if (!isFinite(value) || value < 0) return;
    setCardLimit(limitFor, value);
    setLimitFor(null);
    setLimitValue('');
  }

  return (
    <div>
      <PageHeader
        title={t('cardsPage.title')}
        subtitle={t('cardsPage.subtitle')}
        actions={
          <Button onClick={() => setIssueOpen(true)} disabled={accounts.length === 0}>
            <Plus className="w-4 h-4" />
            {t('cardsPage.issueCard')}
          </Button>
        }
      />

      {cards.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-black/60 border border-black/5">
          {t('cardsPage.noCards')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card) => {
            const account = accounts.find((a) => a.id === card.accountId);
            const isRevealed = !!revealed[card.id];
            const used = card.spentThisMonth;
            const pct = Math.min(100, (used / card.monthlyLimit) * 100);
            return (
              <div key={card.id} className="bg-white rounded-2xl p-5 border border-black/5">
                <CardVisual card={card} reveal={isRevealed} />
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60">{t('cardsPage.linkedTo')}</span>
                    <span className="font-medium text-black">{account?.name ?? '-'}</span>
                  </div>
                  {isRevealed && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/60">CVV</span>
                      <span className="font-mono font-medium text-black">{card.cvv}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between text-xs text-black/60 mb-1">
                      <span>{t('cardsPage.thisMonth')}</span>
                      <span>
                        {formatMoney(card.spentThisMonth, account?.currency ?? 'USD')} /{' '}
                        {formatMoney(card.monthlyLimit, account?.currency ?? 'USD')}
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2B2644]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setRevealed((r) => ({ ...r, [card.id]: !r[card.id] }))
                      }
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {isRevealed ? t('cardsPage.hide') : t('cardsPage.show')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        card.frozen ? unfreezeCard(card.id) : freezeCard(card.id)
                      }
                    >
                      {card.frozen ? <Sun className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
                      {card.frozen ? t('cardsPage.unfreeze') : t('cardsPage.freeze')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setLimitFor(card.id);
                        setLimitValue(String(card.monthlyLimit));
                      }}
                    >
                      {t('cardsPage.setLimit')}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title={t('cardsPage.issueNew')}>
        <form onSubmit={submitIssue} className="space-y-4">
          <Select
            label={t('cardsPage.linkedAccount')}
            value={form.accountId}
            onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.currency}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CardType }))}
            >
              <option value="virtual">{t('cardsPage.virtual')}</option>
              <option value="physical">{t('cardsPage.physical')}</option>
            </Select>
            <Select
              label="Network"
              value={form.network}
              onChange={(e) => setForm((f) => ({ ...f, network: e.target.value as CardNetwork }))}
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            {t('cardsPage.issueCard')}
          </Button>
        </form>
      </Modal>

      <Modal open={!!limitFor} onClose={() => setLimitFor(null)} title={t('cardsPage.setMonthlyLimit')}>
        <form onSubmit={submitLimit} className="space-y-4">
          <Input
            label={t('cardsPage.monthlyLimit')}
            type="number"
            min="0"
            step="100"
            value={limitValue}
            onChange={(e) => setLimitValue(e.target.value)}
          />
          <Button type="submit" className="w-full">
            {t('cardsPage.saveLimit')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
