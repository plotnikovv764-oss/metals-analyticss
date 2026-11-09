import type { PriceQuoteRecord, AveragePriceResult, MarketType } from '@/types/market';

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function computeAveragePrice(
  records: PriceQuoteRecord[],
  marketType: MarketType
): AveragePriceResult {
  const comparable = records.filter((r) => r.marketType === marketType);

  if (comparable.length === 0) {
    return {
      weightedAverage: null,
      simpleAverage: null,
      min: null,
      max: null,
      median: null,
      sourceCount: 0,
      confidence: 'none',
      computedAt: Date.now(),
    };
  }

  const prices = comparable.map((r) => r.price);
  const weights = comparable.map((r) => r.qualityScore);
  const weightSum = weights.reduce((s, w) => s + w, 0);

  const weightedAverage = comparable.reduce((s, r) => s + r.price * r.qualityScore, 0) / weightSum;
  const simpleAverage = prices.reduce((s, p) => s + p, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const med = median(prices);

  const sourceCount = new Set(comparable.map((r) => r.sourceName)).size;
  const avgQuality = weightSum / comparable.length;

  let confidence: AveragePriceResult['confidence'];
  if (sourceCount >= 3 && avgQuality >= 0.85) confidence = 'high';
  else if (sourceCount >= 2 && avgQuality >= 0.75) confidence = 'medium';
  else if (sourceCount >= 1) confidence = 'low';
  else confidence = 'none';

  return {
    weightedAverage,
    simpleAverage,
    min,
    max,
    median: med,
    sourceCount,
    confidence,
    computedAt: Date.now(),
  };
}

export const CONFIDENCE_LABELS: Record<AveragePriceResult['confidence'], string> = {
  high: 'Высокая',
  medium: 'Средняя',
  low: 'Низкая',
  none: 'Недостаточно данных',
};

export const CONFIDENCE_COLORS: Record<AveragePriceResult['confidence'], string> = {
  high: 'text-brand-500',
  medium: 'text-yellow-400',
  low: 'text-orange-400',
  none: 'text-ink-400',
};
