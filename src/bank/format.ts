import type { Currency } from './types';

export const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 1.08,
  UAH: 0.025,
  USDH: 1,
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  UAH: '₴',
  USDH: 'H$',
};

export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  return (amount * RATES[from]) / RATES[to];
}

export function formatMoney(amount: number, currency: Currency): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${CURRENCY_SYMBOL[currency]}${formatted}`;
}

import i18n from '../i18n';

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
  return d.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export function maskCard(number: string): string {
  return `•••• •••• •••• ${number.slice(-4)}`;
}

export function formatCardNumber(number: string): string {
  return number.replace(/(.{4})/g, '$1 ').trim();
}

export function generateIban(): string {
  const country = 'UA';
  const check = Math.floor(10 + Math.random() * 89).toString();
  const body = Array.from({ length: 22 }, () => Math.floor(Math.random() * 10)).join('');
  return `${country}${check}${body}`;
}

export function generateAccountNumber(): string {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

export function generateCardNumber(network: 'visa' | 'mastercard'): string {
  const prefix = network === 'visa' ? '4' : '5';
  const body = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${body}`;
}

export function generateCvv(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

export function generateExpiry(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 3);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

export function apyForTerm(termDays: number): number {
  if (termDays >= 365) return 0.085;
  if (termDays >= 180) return 0.07;
  if (termDays >= 90) return 0.055;
  if (termDays >= 30) return 0.04;
  return 0.03;
}
