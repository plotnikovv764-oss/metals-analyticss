import { METALS } from '@/data/metals';
import { buildQuote } from '@/lib/market';
import type { MetalQuote } from '@/types/market';

export interface AnalystReply {
  text: string;
  quotes: MetalQuote[];
}

function findMentionedMetals(question: string) {
  const tokens = question.toLowerCase().split(/[^a-zа-яё]+/u).filter(Boolean);
  return METALS.filter((metal) =>
    tokens.some(
      (token) =>
        token === metal.symbol.toLowerCase() ||
        token === metal.name.toLowerCase() ||
        metal.aliases.some((alias) => token.startsWith(alias))
    )
  );
}

export function buildDemoReply(question: string, updatedAt: Date): AnalystReply {
  const mentioned = findMentionedMetals(question);

  if (mentioned.length === 0) {
    return {
      text: 'Демо-режим: ИИ-аналитика пока не подключена, поэтому ваш вопрос не анализируется. Назовите металл (например, Neodymium, Nd или неодим), и я покажу его демонстрационную котировку за месяц.',
      quotes: [],
    };
  }

  return {
    text: 'Демо-режим: ниже демонстрационные котировки за 1 месяц по упомянутым металлам. Это не аналитический вывод ИИ.',
    quotes: mentioned.map((metal) => buildQuote(metal, '1M', updatedAt)),
  };
}
