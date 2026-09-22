import { ReactNode } from 'react';

interface SearchHighlightProps {
  text: string;
  query: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function SearchHighlight({ text, query }: SearchHighlightProps): ReactNode {
  const term = query.trim();
  if (!term) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, 'ig'));
  return parts.map((part, index) => part.toLocaleLowerCase() === term.toLocaleLowerCase()
    ? <mark key={`${part}-${index}`} className="rounded bg-primary-light px-0.5 font-inherit text-ink">{part}</mark>
    : part,
  );
}
