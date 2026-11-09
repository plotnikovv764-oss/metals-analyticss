import type { CurrencyCode, UnitCode, ExchangeRate } from '@/types/market';

const DEMO_RATES: Record<CurrencyCode, Record<CurrencyCode, number>> = {
  USD: { USD: 1, EUR: 0.92, RUB: 95, CNY: 7.25 },
  EUR: { USD: 1.087, EUR: 1, RUB: 103.3, CNY: 7.88 },
  RUB: { USD: 0.0105, EUR: 0.0097, RUB: 1, CNY: 0.076 },
  CNY: { USD: 0.138, EUR: 0.127, RUB: 13.1, CNY: 1 },
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: 'USD',
  EUR: 'EUR',
  RUB: 'RUB',
  CNY: 'CNY',
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  CNY: '¥',
};

export const UNIT_LABELS: Record<UnitCode, string> = {
  ton: 'т',
  kg: 'кг',
  g: 'г',
  ozt: 'тр. унц.',
  lb: 'фунт',
};

const UNIT_TO_KG: Record<UnitCode, number> = {
  ton: 1000,
  kg: 1,
  g: 0.001,
  ozt: 0.0311035,
  lb: 0.453592,
};

export function getDemoRates(): ExchangeRate[] {
  const now = Date.now();
  const rates: ExchangeRate[] = [];
  for (const base of Object.keys(DEMO_RATES) as CurrencyCode[]) {
    for (const quote of Object.keys(DEMO_RATES[base]) as CurrencyCode[]) {
      if (base === quote) continue;
      rates.push({ base, quote, rate: DEMO_RATES[base][quote], updatedAt: now });
    }
  }
  return rates;
}

export function getRate(base: CurrencyCode, quote: CurrencyCode): number {
  if (base === quote) return 1;
  return DEMO_RATES[base]?.[quote] ?? 1;
}

export function convertCurrency(
  price: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  return price * getRate(from, to);
}

export function convertUnit(pricePerKg: number, to: UnitCode): number {
  if (to === 'kg') return pricePerKg;
  if (to === 'g') return pricePerKg * 0.001;
  if (to === 'ton') return pricePerKg * 1000;
  if (to === 'ozt') return pricePerKg * 0.0311035;
  if (to === 'lb') return pricePerKg * 0.453592;
  return pricePerKg;
}

export function convertPrice(
  price: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  fromUnit: UnitCode,
  toUnit: UnitCode
): number {
  const pricePerKg = price / UNIT_TO_KG[fromUnit];
  const convertedCurrency = convertCurrency(pricePerKg, fromCurrency, toCurrency);
  return convertUnit(convertedCurrency, toUnit);
}

export function unitToKg(unit: string): UnitCode {
  if (unit === 'ton') return 'ton';
  if (unit === 'ozt') return 'ozt';
  if (unit === 'lb') return 'lb';
  if (unit === 'g') return 'g';
  return 'kg';
}
