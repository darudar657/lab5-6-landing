import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { storage, uid } from './storage';
import {
  apyForTerm,
  convert,
  generateAccountNumber,
  generateCardNumber,
  generateCvv,
  generateExpiry,
  generateIban,
} from './format';
import type {
  Account,
  AccountType,
  Card,
  CardNetwork,
  CardType,
  Counterparty,
  Currency,
  Deposit,
  Transaction,
  TxCategory,
} from './types';

interface BankContextValue {
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
  deposits: Deposit[];

  createAccount: (input: { name: string; type: AccountType; currency: Currency }) => Account;
  createCard: (input: { accountId: string; type: CardType; network: CardNetwork }) => Card;
  freezeCard: (cardId: string) => void;
  unfreezeCard: (cardId: string) => void;
  setCardLimit: (cardId: string, limit: number) => void;

  internalTransfer: (input: {
    fromAccountId: string;
    toAccountId: string;
    amountFrom: number;
    description?: string;
  }) => { ok: true } | { ok: false; error: string };

  externalTransfer: (input: {
    fromAccountId: string;
    amount: number;
    counterparty: Counterparty;
    description?: string;
    category?: TxCategory;
  }) => { ok: true } | { ok: false; error: string };

  exchange: (input: {
    fromAccountId: string;
    toAccountId: string;
    amountFrom: number;
  }) => { ok: true; amountTo: number } | { ok: false; error: string };

  openDeposit: (input: {
    accountId: string;
    principal: number;
    termDays: number;
  }) => { ok: true; deposit: Deposit } | { ok: false; error: string };

  closeDeposit: (depositId: string) => void;

  topUp: (input: {
    accountId: string;
    amount: number;
    source: 'bank_transfer' | 'card' | 'cash' | 'salary';
    note?: string;
  }) => { ok: true } | { ok: false; error: string };

  withdraw: (input: {
    accountId: string;
    amount: number;
    method: 'atm' | 'bank_transfer' | 'cash';
    note?: string;
  }) => { ok: true } | { ok: false; error: string };
}

const TOPUP_LABEL: Record<'bank_transfer' | 'card' | 'cash' | 'salary', string> = {
  bank_transfer: 'Incoming bank transfer',
  card: 'Card top-up',
  cash: 'Cash deposit',
  salary: 'Salary',
};

const WITHDRAW_LABEL: Record<'atm' | 'bank_transfer' | 'cash', string> = {
  atm: 'ATM withdrawal',
  bank_transfer: 'Outgoing bank transfer',
  cash: 'Cash withdrawal',
};

const BankContext = createContext<BankContextValue | null>(null);

export function BankProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  const reload = useCallback(() => {
    if (!user) {
      setAccounts([]);
      setCards([]);
      setTransactions([]);
      setDeposits([]);
      return;
    }
    setAccounts(storage.getAccounts().filter((a) => a.userId === user.id));
    setCards(storage.getCards().filter((c) => c.userId === user.id));
    setTransactions(
      storage
        .getTransactions()
        .filter((t) => t.userId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    );
    setDeposits(storage.getDeposits().filter((d) => d.userId === user.id));
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!user) return;
    const all = storage.getDeposits();
    let changed = false;
    const updated = all.map((d) => {
      if (d.userId !== user.id || d.status !== 'active') return d;
      const days = (Date.now() - new Date(d.startDate).getTime()) / (1000 * 60 * 60 * 24);
      const accrued = d.principal * d.apy * (days / 365);
      if (Math.abs(accrued - d.accruedInterest) > 0.005) {
        changed = true;
        return { ...d, accruedInterest: Math.round(accrued * 100) / 100 };
      }
      return d;
    });
    if (changed) {
      storage.setDeposits(updated);
      setDeposits(updated.filter((d) => d.userId === user.id));
    }
  }, [user]);

  const createAccount = useCallback<BankContextValue['createAccount']>(
    (input) => {
      if (!user) throw new Error('Not logged in');
      const account: Account = {
        id: uid(),
        userId: user.id,
        name: input.name,
        type: input.type,
        currency: input.currency,
        balance: 0,
        iban: generateIban(),
        accountNumber: generateAccountNumber(),
        createdAt: new Date().toISOString(),
      };
      storage.setAccounts([...storage.getAccounts(), account]);
      setAccounts((a) => [...a, account]);
      return account;
    },
    [user],
  );

  const createCard = useCallback<BankContextValue['createCard']>(
    (input) => {
      if (!user) throw new Error('Not logged in');
      const card: Card = {
        id: uid(),
        userId: user.id,
        accountId: input.accountId,
        type: input.type,
        network: input.network,
        number: generateCardNumber(input.network),
        expiry: generateExpiry(),
        cvv: generateCvv(),
        holder: `${user.firstName} ${user.lastName}`.toUpperCase(),
        frozen: false,
        monthlyLimit: input.type === 'physical' ? 10000 : 5000,
        spentThisMonth: 0,
        createdAt: new Date().toISOString(),
      };
      storage.setCards([...storage.getCards(), card]);
      setCards((c) => [...c, card]);
      return card;
    },
    [user],
  );

  const setCardField = useCallback((cardId: string, patch: Partial<Card>) => {
    const all = storage.getCards();
    const updated = all.map((c) => (c.id === cardId ? { ...c, ...patch } : c));
    storage.setCards(updated);
    setCards((cs) => cs.map((c) => (c.id === cardId ? { ...c, ...patch } : c)));
  }, []);

  const freezeCard = useCallback((cardId: string) => setCardField(cardId, { frozen: true }), [setCardField]);
  const unfreezeCard = useCallback((cardId: string) => setCardField(cardId, { frozen: false }), [setCardField]);
  const setCardLimit = useCallback(
    (cardId: string, limit: number) => setCardField(cardId, { monthlyLimit: limit }),
    [setCardField],
  );

  const adjustAccount = useCallback((accountId: string, delta: number) => {
    const all = storage.getAccounts();
    const updated = all.map((a) =>
      a.id === accountId ? { ...a, balance: Math.round((a.balance + delta) * 100) / 100 } : a,
    );
    storage.setAccounts(updated);
    return updated;
  }, []);

  const appendTx = useCallback((tx: Transaction) => {
    const all = [...storage.getTransactions(), tx];
    storage.setTransactions(all);
  }, []);

  const refreshFromStorage = useCallback(() => {
    if (!user) return;
    setAccounts(storage.getAccounts().filter((a) => a.userId === user.id));
    setTransactions(
      storage
        .getTransactions()
        .filter((t) => t.userId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    );
    setDeposits(storage.getDeposits().filter((d) => d.userId === user.id));
  }, [user]);

  const internalTransfer = useCallback<BankContextValue['internalTransfer']>(
    (input) => {
      if (!user) return { ok: false, error: 'Not logged in' };
      const from = accounts.find((a) => a.id === input.fromAccountId);
      const to = accounts.find((a) => a.id === input.toAccountId);
      if (!from || !to) return { ok: false, error: 'Account not found' };
      if (from.id === to.id) return { ok: false, error: 'Cannot transfer to same account' };
      if (input.amountFrom <= 0) return { ok: false, error: 'Amount must be positive' };
      if (from.balance < input.amountFrom) return { ok: false, error: 'Insufficient funds' };
      const amountTo = convert(input.amountFrom, from.currency, to.currency);
      adjustAccount(from.id, -input.amountFrom);
      adjustAccount(to.id, amountTo);
      const now = new Date().toISOString();
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: from.id,
        amount: -input.amountFrom,
        currency: from.currency,
        category: 'transfer',
        merchant: `To ${to.name}`,
        description: input.description,
        date: now,
        status: 'completed',
      });
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: to.id,
        amount: amountTo,
        currency: to.currency,
        category: 'transfer',
        merchant: `From ${from.name}`,
        description: input.description,
        date: now,
        status: 'completed',
      });
      refreshFromStorage();
      return { ok: true };
    },
    [user, accounts, adjustAccount, appendTx, refreshFromStorage],
  );

  const externalTransfer = useCallback<BankContextValue['externalTransfer']>(
    (input) => {
      if (!user) return { ok: false, error: 'Not logged in' };
      const from = accounts.find((a) => a.id === input.fromAccountId);
      if (!from) return { ok: false, error: 'Account not found' };
      if (input.amount <= 0) return { ok: false, error: 'Amount must be positive' };
      if (from.balance < input.amount) return { ok: false, error: 'Insufficient funds' };
      adjustAccount(from.id, -input.amount);
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: from.id,
        amount: -input.amount,
        currency: from.currency,
        category: input.category ?? 'transfer',
        merchant: input.counterparty.name,
        description: input.description,
        date: new Date().toISOString(),
        status: 'completed',
        counterparty: input.counterparty,
      });
      refreshFromStorage();
      return { ok: true };
    },
    [user, accounts, adjustAccount, appendTx, refreshFromStorage],
  );

  const exchange = useCallback<BankContextValue['exchange']>(
    (input) => {
      if (!user) return { ok: false, error: 'Not logged in' };
      const from = accounts.find((a) => a.id === input.fromAccountId);
      const to = accounts.find((a) => a.id === input.toAccountId);
      if (!from || !to) return { ok: false, error: 'Account not found' };
      if (from.id === to.id) return { ok: false, error: 'Same account' };
      if (input.amountFrom <= 0) return { ok: false, error: 'Amount must be positive' };
      if (from.balance < input.amountFrom) return { ok: false, error: 'Insufficient funds' };
      const amountTo = convert(input.amountFrom, from.currency, to.currency);
      adjustAccount(from.id, -input.amountFrom);
      adjustAccount(to.id, amountTo);
      const now = new Date().toISOString();
      const note = `Exchange ${from.currency}→${to.currency}`;
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: from.id,
        amount: -input.amountFrom,
        currency: from.currency,
        category: 'transfer',
        merchant: note,
        description: note,
        date: now,
        status: 'completed',
      });
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: to.id,
        amount: amountTo,
        currency: to.currency,
        category: 'transfer',
        merchant: note,
        description: note,
        date: now,
        status: 'completed',
      });
      refreshFromStorage();
      return { ok: true, amountTo: Math.round(amountTo * 100) / 100 };
    },
    [user, accounts, adjustAccount, appendTx, refreshFromStorage],
  );

  const openDeposit = useCallback<BankContextValue['openDeposit']>(
    (input) => {
      if (!user) return { ok: false, error: 'Not logged in' };
      const from = accounts.find((a) => a.id === input.accountId);
      if (!from) return { ok: false, error: 'Account not found' };
      if (input.principal <= 0) return { ok: false, error: 'Amount must be positive' };
      if (from.balance < input.principal) return { ok: false, error: 'Insufficient funds' };
      adjustAccount(from.id, -input.principal);
      const apy = apyForTerm(input.termDays);
      const deposit: Deposit = {
        id: uid(),
        userId: user.id,
        accountId: from.id,
        principal: input.principal,
        currency: from.currency,
        apy,
        startDate: new Date().toISOString(),
        termDays: input.termDays,
        accruedInterest: 0,
        status: 'active',
      };
      storage.setDeposits([...storage.getDeposits(), deposit]);
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: from.id,
        amount: -input.principal,
        currency: from.currency,
        category: 'transfer',
        merchant: 'Deposit opened',
        description: `${input.termDays}d term @ ${(apy * 100).toFixed(2)}% APY`,
        date: new Date().toISOString(),
        status: 'completed',
      });
      refreshFromStorage();
      return { ok: true, deposit };
    },
    [user, accounts, adjustAccount, appendTx, refreshFromStorage],
  );

  const closeDeposit = useCallback(
    (depositId: string) => {
      if (!user) return;
      const all = storage.getDeposits();
      const deposit = all.find((d) => d.id === depositId);
      if (!deposit || deposit.status === 'closed') return;
      const payout = Math.round((deposit.principal + deposit.accruedInterest) * 100) / 100;
      adjustAccount(deposit.accountId, payout);
      const updatedDeposits = all.map((d) =>
        d.id === depositId ? { ...d, status: 'closed' as const } : d,
      );
      storage.setDeposits(updatedDeposits);
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: deposit.accountId,
        amount: payout,
        currency: deposit.currency,
        category: 'transfer',
        merchant: 'Deposit closed',
        description: `Principal ${deposit.principal} + interest ${deposit.accruedInterest.toFixed(2)}`,
        date: new Date().toISOString(),
        status: 'completed',
      });
      refreshFromStorage();
    },
    [user, adjustAccount, appendTx, refreshFromStorage],
  );

  const topUp = useCallback<BankContextValue['topUp']>(
    (input) => {
      if (!user) return { ok: false, error: 'Not logged in' };
      const acc = accounts.find((a) => a.id === input.accountId);
      if (!acc) return { ok: false, error: 'Account not found' };
      if (input.amount <= 0) return { ok: false, error: 'Amount must be positive' };
      adjustAccount(acc.id, input.amount);
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: acc.id,
        amount: input.amount,
        currency: acc.currency,
        category: input.source === 'salary' ? 'salary' : 'transfer',
        merchant: TOPUP_LABEL[input.source],
        description: input.note,
        date: new Date().toISOString(),
        status: 'completed',
      });
      refreshFromStorage();
      return { ok: true };
    },
    [user, accounts, adjustAccount, appendTx, refreshFromStorage],
  );

  const withdraw = useCallback<BankContextValue['withdraw']>(
    (input) => {
      if (!user) return { ok: false, error: 'Not logged in' };
      const acc = accounts.find((a) => a.id === input.accountId);
      if (!acc) return { ok: false, error: 'Account not found' };
      if (input.amount <= 0) return { ok: false, error: 'Amount must be positive' };
      if (acc.balance < input.amount) return { ok: false, error: 'Insufficient funds' };
      adjustAccount(acc.id, -input.amount);
      appendTx({
        id: uid(),
        userId: user.id,
        accountId: acc.id,
        amount: -input.amount,
        currency: acc.currency,
        category: 'transfer',
        merchant: WITHDRAW_LABEL[input.method],
        description: input.note,
        date: new Date().toISOString(),
        status: 'completed',
      });
      refreshFromStorage();
      return { ok: true };
    },
    [user, accounts, adjustAccount, appendTx, refreshFromStorage],
  );

  const value = useMemo(
    () => ({
      accounts,
      cards,
      transactions,
      deposits,
      createAccount,
      createCard,
      freezeCard,
      unfreezeCard,
      setCardLimit,
      internalTransfer,
      externalTransfer,
      exchange,
      openDeposit,
      closeDeposit,
      topUp,
      withdraw,
    }),
    [
      accounts,
      cards,
      transactions,
      deposits,
      createAccount,
      createCard,
      freezeCard,
      unfreezeCard,
      setCardLimit,
      internalTransfer,
      externalTransfer,
      exchange,
      openDeposit,
      closeDeposit,
      topUp,
      withdraw,
    ],
  );

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank(): BankContextValue {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank must be used inside BankProvider');
  return ctx;
}
