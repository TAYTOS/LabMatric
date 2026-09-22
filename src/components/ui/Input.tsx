import React, { useId } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
        <div className="relative">
          {leftIcon &&
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </span>
          }
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            required={required}
            className={cn(
              'h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-ink placeholder:text-muted transition-colors duration-150 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy',
              error ? 'border-danger' : 'border-border',
              !!leftIcon && 'pl-11',
              !!rightElement && 'pr-11',
              className
            )}
            {...props} />
          
          {rightElement &&
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">{rightElement}</span>
          }
        </div>
        {error ?
        <p id={errorId} className="flex items-center gap-1.5 text-sm text-danger">
            <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p> :
        hint ?
        <p id={hintId} className="text-sm text-muted">
            {hint}
          </p> :
        null}
      </div>);

  }
);
Input.displayName = 'Input';