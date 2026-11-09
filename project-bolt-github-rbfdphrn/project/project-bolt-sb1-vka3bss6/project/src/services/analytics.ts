import { METAL_MAP, METALS } from '@/data/metals';
import { CATEGORY_MAP } from '@/data/categories';
import type { MetalQuote, MetalCategoryId, PeriodKey } from '@/types/market';
import { buildQuotes, getVolatility, getTrendDirection } from '@/services/market';

export interface AnalyticsRow {
  metalId: string;
  metalName: string;
  metalNameRu: string;
  symbol: string;
  categoryId: MetalCategoryId;
  price: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  yearlyChange: number;
  volatility: number;
  trend: 'up' | 'down' | 'flat';
}

export interface CategoryComparison {
  categoryId: MetalCategoryId;
  categoryName: string;
  metalCount: number;
  avgChangePct: number;
  avgVolatility: number;
  trend: 'up' | 'down' | 'flat';
}

export function buildAnalyticsTable(
  metalIds: string[],
  updatedAt: Date
): AnalyticsRow[] {
  return metalIds.map((id) => {
    const metal = METAL_MAP[id];
    const daily = buildQuotes([metal], '1D', updatedAt)[0];
    const weekly = buildQuotes([metal], '1W', updatedAt)[0];
    const monthly = buildQuotes([metal], '1M', updatedAt)[0];
    const yearly = buildQuotes([metal], '1Y', updatedAt)[0];
    const vol = getVolatility(monthly);

    return {
      metalId: metal.id,
      metalName: metal.name,
      metalNameRu: metal.nameRu,
      symbol: metal.symbol,
      categoryId: metal.categoryId,
      price: monthly.price,
      dailyChange: daily.changePct,
      weeklyChange: weekly.changePct,
      monthlyChange: monthly.changePct,
      yearlyChange: yearly.changePct,
      volatility: vol,
      trend: getTrendDirection(monthly),
    };
  });
}

export function buildCategoryComparisons(
  quotes: MetalQuote[],
  categoryId: MetalCategoryId
): CategoryComparison | null {
  const catQuotes = quotes.filter((q) => q.metal.categoryId === categoryId);
  if (catQuotes.length === 0) return null;

  const avgChange = catQuotes.reduce((s, q) => s + q.changePct, 0) / catQuotes.length;
  const vols = catQuotes.map((q) => getVolatility(q));
  const avgVol = vols.reduce((s, v) => s + v, 0) / vols.length;
  const trend = avgChange > 0.5 ? 'up' : avgChange < -0.5 ? 'down' : 'flat';

  const cat = CATEGORY_MAP[categoryId];

  return {
    categoryId,
    categoryName: cat.name,
    metalCount: catQuotes.length,
    avgChangePct: avgChange,
    avgVolatility: avgVol,
    trend,
  };
}

export function buildAllCategoryComparisons(quotes: MetalQuote[]): CategoryComparison[] {
  return METALS.reduce((acc, metal) => {
    if (acc.some((c) => c.categoryId === metal.categoryId)) return acc;
    const comp = buildCategoryComparisons(quotes, metal.categoryId);
    if (comp) acc.push(comp);
    return acc;
  }, [] as CategoryComparison[]);
}

export function rankByChange(quotes: MetalQuote[], direction: 'up' | 'down'): MetalQuote[] {
  return [...quotes].sort((a, b) =>
    direction === 'up' ? b.changePct - a.changePct : a.changePct - b.changePct
  );
}

export function rankByVolatility(quotes: MetalQuote[]): MetalQuote[] {
  return [...quotes].sort((a, b) => getVolatility(b) - getVolatility(a));
}
