import { PERIODS } from '@/data/periods';
import type { Metal, MetalQuote, PeriodKey, PricePoint } from '@/types/market';

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getPeriod(key: PeriodKey) {
  const period = PERIODS.find((item) => item.key === key);
  if (!period) throw new Error(`Unknown period: ${key}`);
  return period;
}

function buildSeries(metal: Metal, periodKey: PeriodKey, endTime: number): PricePoint[] {
  const period = getPeriod(periodKey);
  const random = createRandom(hashString(`${metal.symbol}:${period.key}`));
  const prices = new Array<number>(period.points);
  prices[period.points - 1] = metal.basePrice;

  for (let i = period.points - 2; i >= 0; i--) {
    const shock = (random() + random() + random() - 1.5) / 1.5;
    const move = (shock * metal.volatility + metal.trend) * period.volatilityScale;
    prices[i] = prices[i + 1] / (1 + move);
  }

  return prices.map((price, i) => ({
    date: endTime - (period.points - 1 - i) * period.stepMs,
    price,
  }));
}

export function buildQuote(metal: Metal, periodKey: PeriodKey, updatedAt: Date): MetalQuote {
  const series = buildSeries(metal, periodKey, updatedAt.getTime());
  const values = series.map((point) => point.price);
  const first = values[0];
  const last = values[values.length - 1];

  return {
    metal,
    price: last,
    change: last - first,
    changePct: ((last - first) / first) * 100,
    high: Math.max(...values),
    low: Math.min(...values),
    series,
  };
}

export function buildQuotes(metals: Metal[], periodKey: PeriodKey, updatedAt: Date): MetalQuote[] {
  return metals.map((metal) => buildQuote(metal, periodKey, updatedAt));
}

export function buildIndex(quotes: MetalQuote[]): PricePoint[] {
  if (quotes.length === 0) return [];
  const length = quotes[0].series.length;

  return Array.from({ length }, (_, i) => {
    const average =
      quotes.reduce((sum, quote) => sum + quote.series[i].price / quote.series[0].price, 0) /
      quotes.length;
    return { date: quotes[0].series[i].date, price: average * 100 };
  });
}
