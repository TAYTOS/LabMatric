import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar',
  onFilterClick,
  activeFilterCount = 0,
  className
}: SearchBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-9 text-[15px] text-ink placeholder:text-muted focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/30" />
        
        {value &&
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
          
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      </div>
      {onFilterClick &&
      <button
        type="button"
        onClick={onFilterClick}
        aria-label="Filtros"
        className={cn(
          'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-150 ease-out',
          activeFilterCount > 0 ?
          'border-burgundy bg-burgundy-light text-burgundy' :
          'border-border bg-white text-ink hover:bg-neutral'
        )}>
        
          <SlidersHorizontalIcon className="h-5 w-5" aria-hidden="true" />
          {activeFilterCount > 0 &&
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
        }
        </button>
      }
    </div>);

}