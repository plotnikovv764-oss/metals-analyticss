import Delta from '@/components/common/Delta';
import { formatPercent, formatPrice } from '@/lib/format';
import type { MetalQuote } from '@/types/market';

interface MetalCardProps {
  quote: MetalQuote;
  onSelect: () => void;
}

export default function MetalCard({ quote, onSelect }: MetalCardProps) {
  const { metal } = quote;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full flex-col rounded-2xl border border-ink-800 bg-ink-900/70 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:bg-ink-900 hover:shadow-[0_12px_32px_-16px_rgba(0,199,129,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-ink-100">{metal.name}</p>
          <p className="mt-1 text-xs text-ink-400">{metal.group}</p>
        </div>
        <span className="shrink-0 rounded-md bg-ink-800 px-2 py-0.5 text-xs font-medium text-ink-300 transition-colors group-hover:text-brand-400">
          {metal.symbol}
        </span>
      </div>

      <div className="mt-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tabular-nums text-ink-100">{formatPrice(quote.price)}</p>
          <p className="mt-1 text-xs text-ink-400">за кг, USD</p>
        </div>
        <div className="text-right">
          <Delta value={quote.changePct} text={formatPercent(quote.changePct)} className="justify-end" />
          <p className="mt-1 text-xs text-ink-400">за 1М</p>
        </div>
      </div>
    </button>
  );
}
