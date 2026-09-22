import { BottomSheet } from './BottomSheet';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  groups: FilterGroup[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  resultCount: number;
}

export function FilterSheet({ open, onClose, groups, values, onChange, onClear, resultCount }: FilterSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Filtrar cursos">
      <div className="flex flex-col gap-5">
        {groups.map((group) =>
        <fieldset key={group.key} className="flex flex-col gap-2">
            <legend className="text-sm font-semibold text-ink">{group.label}</legend>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
              const isActive = values[group.key] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onChange(group.key, option.value)}
                  className={cn(
                    'rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-150 ease-out',
                    isActive ?
                    'border-burgundy bg-burgundy text-white' :
                    'border-border bg-white text-ink hover:bg-neutral'
                  )}>
                  
                    {option.label}
                  </button>);

            })}
            </div>
          </fieldset>
        )}
        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClear} className="flex-1">
            Limpiar
          </Button>
          <Button variant="primary" onClick={onClose} className="flex-1">
            Ver {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
          </Button>
        </div>
      </div>
    </BottomSheet>);

}