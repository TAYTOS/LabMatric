import React, { useId } from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, checked, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-start gap-2.5 select-none">
          <span className="relative mt-0.5 shrink-0">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              checked={checked}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className="peer absolute inset-0 z-10 h-5 w-5 cursor-pointer opacity-0"
              {...props} />
            
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-md border-2 border-border bg-white transition-colors duration-150 ease-out',
                'peer-checked:border-burgundy peer-checked:bg-burgundy',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy/30',
                className
              )}>
              
              {checked && <CheckIcon className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
            </span>
          </span>
          <span className="text-sm text-ink">{label}</span>
        </label>
        {error && <p id={`${inputId}-error`} className="pl-7 text-sm text-danger">{error}</p>}
      </div>);

  }
);
Checkbox.displayName = 'Checkbox';
