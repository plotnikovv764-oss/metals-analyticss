import { useMemo, useState } from 'react';
import DemoBadge from '@/components/common/DemoBadge';
import SearchInput from '@/components/common/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import MetalCard from '@/components/metals/MetalCard';
import MetalDetailDialog from '@/components/metals/MetalDetailDialog';
import { METALS } from '@/data/metals';
import { buildQuotes } from '@/lib/market';
import type { Metal } from '@/types/market';

interface MetalsPageProps {
  updatedAt: Date;
}

export default function MetalsPage({ updatedAt }: MetalsPageProps) {
  const [query, setQuery] = useState('');
  const [selectedMetal, setSelectedMetal] = useState<Metal | null>(null);

  const quotes = useMemo(() => buildQuotes(METALS, '1M', updatedAt), [updatedAt]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleQuotes = normalizedQuery
    ? quotes.filter(
        (quote) =>
          quote.metal.name.toLowerCase().includes(normalizedQuery) ||
          quote.metal.symbol.toLowerCase().includes(normalizedQuery) ||
          quote.metal.group.toLowerCase().includes(normalizedQuery)
      )
    : quotes;

  return (
    <>
      <PageHeader
        title="Металлы"
        description="Каталог редкоземельных металлов. Выберите металл, чтобы открыть его демонстрационную карточку."
        actions={<DemoBadge />}
      />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Поиск по названию или символу"
        className="mb-6 max-w-md"
      />

      {visibleQuotes.length === 0 ? (
        <p className="rounded-2xl border border-ink-800 bg-ink-900/70 px-5 py-12 text-center text-sm text-ink-400">
          Ничего не найдено по запросу «{query.trim()}»
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleQuotes.map((quote) => (
            <MetalCard
              key={quote.metal.symbol}
              quote={quote}
              onSelect={() => setSelectedMetal(quote.metal)}
            />
          ))}
        </div>
      )}

      {selectedMetal && (
        <MetalDetailDialog
          metal={selectedMetal}
          initialPeriod="1M"
          updatedAt={updatedAt}
          onClose={() => setSelectedMetal(null)}
        />
      )}
    </>
  );
}
