import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpFromLine,
  CreditCard,
  Repeat,
} from 'lucide-react';
import { useBank } from '../../bank/BankContext';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { Button } from '../../components/ui/Button';
import { MoneyOpsModals } from '../../components/ui/MoneyOpsModals';
import { formatIban, formatMoney } from '../../bank/format';

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accounts, transactions } = useBank();
  const account = accounts.find((a) => a.id === id);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  if (!account) {
    return (
      <div>
        <Link to="/app/accounts" className="text-sm text-black/60 hover:text-black inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to accounts
        </Link>
        <div className="bg-white rounded-2xl p-12 text-center text-black/60">
          Account not found.
        </div>
      </div>
    );
  }

  const accountTxs = transactions.filter((t) => t.accountId === account.id);

  return (
    <div>
      <Link
        to="/app/accounts"
        className="text-sm text-black/60 hover:text-black inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to accounts
      </Link>

      <div className="bg-[#2B2644] rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-white/60 uppercase tracking-wider">{account.type}</div>
              <div className="text-2xl font-medium mt-1">{account.name}</div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 font-medium">
              {account.currency}
            </span>
          </div>
          <div
            className="text-5xl md:text-6xl font-medium leading-none"
            style={{ letterSpacing: '-0.04em' }}
          >
            {formatMoney(account.balance, account.currency)}
          </div>
          <div className="text-xs text-white/50 font-mono mt-6">IBAN · {formatIban(account.iban)}</div>
          <div className="text-xs text-white/50 font-mono mt-1">ACCT · {account.accountNumber}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => setTopUpOpen(true)}>
          <ArrowDownToLine className="w-4 h-4" />
          Top up
        </Button>
        <Button variant="secondary" onClick={() => setWithdrawOpen(true)}>
          <ArrowUpFromLine className="w-4 h-4" />
          Withdraw
        </Button>
        <Link to="/app/transfers">
          <Button variant="secondary">
            <ArrowLeftRight className="w-4 h-4" />
            Transfer
          </Button>
        </Link>
        <Link to="/app/exchange">
          <Button variant="secondary">
            <Repeat className="w-4 h-4" />
            Exchange
          </Button>
        </Link>
        <Link to="/app/cards">
          <Button variant="secondary">
            <CreditCard className="w-4 h-4" />
            Issue card
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-black/5">
        <div className="text-2xl font-medium text-black mb-4" style={{ letterSpacing: '-0.02em' }}>
          Transactions
        </div>
        <div className="divide-y divide-black/5">
          {accountTxs.length === 0 ? (
            <div className="py-8 text-center text-black/50">No transactions on this account.</div>
          ) : (
            accountTxs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
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
        defaultAccountId={account.id}
      />
    </div>
  );
}
