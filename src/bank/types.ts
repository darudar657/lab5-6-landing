export type Currency = 'USD' | 'EUR' | 'UAH' | 'USDH';

export type AccountType = 'checking' | 'savings' | 'halo';
export type CardType = 'virtual' | 'physical';
export type CardNetwork = 'visa' | 'mastercard';
export type TxStatus = 'completed' | 'pending' | 'failed';
export type TxCategory =
  | 'transfer'
  | 'groceries'
  | 'salary'
  | 'utilities'
  | 'entertainment'
  | 'transport'
  | 'food'
  | 'subscription'
  | 'other';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  kycLevel: 'basic' | 'verified';
  twoFa: boolean;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  iban: string;
  accountNumber: string;
  createdAt: string;
}

export interface Card {
  id: string;
  userId: string;
  accountId: string;
  type: CardType;
  network: CardNetwork;
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
  frozen: boolean;
  monthlyLimit: number;
  spentThisMonth: number;
  createdAt: string;
}

export interface Counterparty {
  name: string;
  iban?: string;
  cardLast4?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  currency: Currency;
  category: TxCategory;
  merchant: string;
  description?: string;
  date: string;
  status: TxStatus;
  counterparty?: Counterparty;
}

export interface Deposit {
  id: string;
  userId: string;
  accountId: string;
  principal: number;
  currency: Currency;
  apy: number;
  startDate: string;
  termDays: number;
  accruedInterest: number;
  status: 'active' | 'closed';
}

export interface Session {
  userId: string;
  issuedAt: string;
  expiresAt: string;
}
