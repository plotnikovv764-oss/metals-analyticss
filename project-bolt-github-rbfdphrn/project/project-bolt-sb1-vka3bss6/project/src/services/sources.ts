import type { PriceQuoteRecord, MarketType, Metal } from '@/types/market';
import { PRICE_SOURCES, MARKET_TYPE_LABELS } from '@/data/sources';

export interface SourceIntegration {
  id: string;
  name: string;
  url: string;
  marketType: MarketType;
  region: string;
  qualityScore: number;
  status: 'configured' | 'pending' | 'demo';
  description: string;
}

export const SOURCE_INTEGRATIONS: SourceIntegration[] = PRICE_SOURCES.map((src) => ({
  ...src,
  status: 'pending' as const,
  description: `Источник котировок — ${MARKET_TYPE_LABELS[src.marketType]}. Подключение API в процессе подготовки.`,
}));

export function getSourcesForMetal(metal: Metal): SourceIntegration[] {
  return SOURCE_INTEGRATIONS.filter((src) =>
    metal.marketTypes.includes(src.marketType)
  );
}

export function getSourcesByMarketType(marketType: MarketType): SourceIntegration[] {
  return SOURCE_INTEGRATIONS.filter((src) => src.marketType === marketType);
}

export function buildDemoQuoteRecords(
  metal: Metal,
  price: number,
  updatedAt: Date
): PriceQuoteRecord[] {
  const sources = getSourcesForMetal(metal);
  const timestamp = updatedAt.getTime();

  return sources.slice(0, 3).map((src, index) => ({
    sourceName: src.name,
    sourceUrl: src.url,
    metalId: metal.id,
    price: price * (1 + (index - 1) * 0.002),
    currency: metal.currency,
    unit: metal.unit,
    marketType: src.marketType,
    region: src.region,
    timestamp,
    retrievedAt: timestamp,
    dataStatus: 'demo',
    qualityScore: src.qualityScore,
  }));
}
