import type { Account, Card, Deposit, Session, Transaction, User } from './types';

const KEYS = {
  users: 'halo.users',
  accounts: 'halo.accounts',
  cards: 'halo.cards',
  transactions: 'halo.transactions',
  deposits: 'halo.deposits',
  session: 'halo.session',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getUsers: () => read<User[]>(KEYS.users, []),
  setUsers: (v: User[]) => write(KEYS.users, v),

  getAccounts: () => read<Account[]>(KEYS.accounts, []),
  setAccounts: (v: Account[]) => write(KEYS.accounts, v),

  getCards: () => read<Card[]>(KEYS.cards, []),
  setCards: (v: Card[]) => write(KEYS.cards, v),

  getTransactions: () => read<Transaction[]>(KEYS.transactions, []),
  setTransactions: (v: Transaction[]) => write(KEYS.transactions, v),

  getDeposits: () => read<Deposit[]>(KEYS.deposits, []),
  setDeposits: (v: Deposit[]) => write(KEYS.deposits, v),

  getSession: () => read<Session | null>(KEYS.session, null),
  setSession: (v: Session | null) => {
    if (v === null) localStorage.removeItem(KEYS.session);
    else write(KEYS.session, v);
  },
};

// Symbolic hashing for uni demo only - NOT real security.
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

export function uid(): string {
  return crypto.randomUUID();
}
