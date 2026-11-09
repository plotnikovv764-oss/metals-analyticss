import Delta from '@/components/common/Delta';
import { formatPercent, formatPrice, formatPriceChange } from '@/lib/format';
import type { Metal, MetalQuote } from '@/types/market';

interface QuotesTableProps {
  quotes: MetalQuote[];
  emptyText: string;
  onSelect: (metal: Metal) => void;
}

export default function QuotesTable({ quotes, emptyText, onSelect }: QuotesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-800 text-left text-xs font-medium uppercase tracking-[0.12em] text-ink-400">
            <th scope="col" className="px-5 py-3 font-medium">Металл</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">Цена</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">Изменение</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">Изменение %</th>
          </tr>
        </thead>
        <tbody>
          {quotes.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-10 text-center text-sm text-ink-400">
                {emptyText}
              </td>
            </tr>
          )}
          {quotes.map((quote) => (
            <tr
              key={quote.metal.symbol}
              onClick={() => onSelect(quote.metal)}
              className="cursor-pointer border-b border-ink-800/70 transition-colors duration-150 last:border-b-0 hover:bg-ink-800/50"
            >
              <td className="px-5 py-4">
                <span className="font-medium text-ink-100">{quote.metal.name}</span>
                <span className="ml-2 text-ink-500">{quote.metal.symbol}</span>
              </td>
              <td className="px-5 py-4 text-right font-medium tabular-nums text-ink-100">
                {formatPrice(quote.price)}
              </td>
              <td className="px-5 py-4 text-right">
                <Delta value={quote.change} text={formatPriceChange(quote.change)} className="justify-end" />
              </td>
              <td className="px-5 py-4 text-right">
                <Delta value={quote.changePct} text={formatPercent(quote.changePct)} className="justify-end" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
