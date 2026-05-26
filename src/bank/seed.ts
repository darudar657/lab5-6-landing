import type { Account, Card, Transaction, TxCategory, User } from './types';
import { storage, uid } from './storage';
import {
  generateAccountNumber,
  generateCardNumber,
  generateCvv,
  generateExpiry,
  generateIban,
} from './format';

const MERCHANTS: Record<TxCategory, string[]> = {
  groceries: ['Whole Foods', 'Trader Joe\'s', 'ATB', 'Silpo', 'Lidl', 'Costco', 'Auchan'],
  salary: ['Acme Corp Payroll', 'TechHub Inc.', 'Freelance Payment', 'Bonus Q'],
  utilities: ['Electric Co.', 'Water Utility', 'Internet Provider', 'Gas Co.', 'Heating'],
  entertainment: ['Netflix', 'Spotify', 'Steam', 'Cinema City', 'Disney+', 'HBO Max'],
  transport: ['Uber', 'Bolt', 'Lyft', 'Metro Pass', 'Shell Gas', 'BP', 'OKKO'],
  food: ['McDonald\'s', 'Starbucks', 'Pizza Hut', 'Local Cafe', 'Sushi Bar', 'KFC', 'Puzata Hata'],
  subscription: ['Adobe', 'GitHub Pro', 'Notion', 'iCloud', 'ChatGPT Plus', 'Figma'],
  transfer: ['Internal Transfer', 'P2P Transfer'],
  other: ['Amazon', 'eBay', 'Apple Store', 'IKEA', 'Rozetka', 'Booking.com'],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 1));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function seedNewUser(user: User): Promise<void> {
  const now = new Date();

  const checkingId = uid();
  const savingsId = uid();
  const haloId = uid();

  const accounts: Account[] = [
    {
      id: checkingId,
      userId: user.id,
      name: 'Main USD',
      type: 'checking',
      currency: 'USD',
      balance: round2(randRange(800, 9500)),
      iban: generateIban(),
      accountNumber: generateAccountNumber(),
      createdAt: now.toISOString(),
    },
    {
      id: savingsId,
      userId: user.id,
      name: 'Savings UAH',
      type: 'savings',
      currency: 'UAH',
      balance: round2(randRange(15000, 280000)),
      iban: generateIban(),
      accountNumber: generateAccountNumber(),
      createdAt: now.toISOString(),
    },
    {
      id: haloId,
      userId: user.id,
      name: 'USD Halo Wallet',
      type: 'halo',
      currency: 'USDH',
      balance: round2(randRange(0, 3500)),
      iban: generateIban(),
      accountNumber: generateAccountNumber(),
      createdAt: now.toISOString(),
    },
  ];

  if (Math.random() < 0.35) {
    accounts.push({
      id: uid(),
      userId: user.id,
      name: 'EUR Holiday',
      type: 'checking',
      currency: 'EUR',
      balance: round2(randRange(150, 4200)),
      iban: generateIban(),
      accountNumber: generateAccountNumber(),
      createdAt: now.toISOString(),
    });
  }

  const virtualLimit = randInt(2000, 8000);
  const physicalLimit = randInt(6000, 15000);

  const cards: Card[] = [
    {
      id: uid(),
      userId: user.id,
      accountId: checkingId,
      type: 'virtual',
      network: Math.random() < 0.5 ? 'visa' : 'mastercard',
      number: generateCardNumber('visa'),
      expiry: generateExpiry(),
      cvv: generateCvv(),
      holder: `${user.firstName} ${user.lastName}`.toUpperCase(),
      frozen: false,
      monthlyLimit: virtualLimit,
      spentThisMonth: round2(randRange(virtualLimit * 0.05, virtualLimit * 0.7)),
      createdAt: now.toISOString(),
    },
    {
      id: uid(),
      userId: user.id,
      accountId: checkingId,
      type: 'physical',
      network: Math.random() < 0.5 ? 'visa' : 'mastercard',
      number: generateCardNumber('mastercard'),
      expiry: generateExpiry(),
      cvv: generateCvv(),
      holder: `${user.firstName} ${user.lastName}`.toUpperCase(),
      frozen: false,
      monthlyLimit: physicalLimit,
      spentThisMonth: round2(randRange(physicalLimit * 0.1, physicalLimit * 0.75)),
      createdAt: now.toISOString(),
    },
  ];

  const txs: Transaction[] = [];
  const categories: TxCategory[] = [
    'groceries',
    'food',
    'transport',
    'entertainment',
    'subscription',
    'utilities',
    'other',
  ];

  const txCount = randInt(25, 55);
  const salaryDays = new Set<number>();
  while (salaryDays.size < randInt(1, 3)) {
    salaryDays.add(randInt(1, 28));
  }

  for (let i = 0; i < txCount; i++) {
    const isSalary = salaryDays.has(i);
    const category: TxCategory = isSalary ? 'salary' : pick(categories);
    const amount = isSalary
      ? round2(randRange(1800, 5400))
      : -round2(randRange(3, 380));
    const daysAgo = i + Math.floor(Math.random() * 2);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(randInt(7, 22), randInt(0, 59));
    txs.push({
      id: uid(),
      userId: user.id,
      accountId: checkingId,
      amount,
      currency: 'USD',
      category,
      merchant: pick(MERCHANTS[category]),
      date: date.toISOString(),
      status: 'completed',
    });
  }

  storage.setAccounts([...storage.getAccounts(), ...accounts]);
  storage.setCards([...storage.getCards(), ...cards]);
  storage.setTransactions([...storage.getTransactions(), ...txs]);
}
