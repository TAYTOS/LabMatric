import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-burgundy text-white hover:bg-burgundy-dark active:bg-burgundy-dark disabled:bg-burgundy/40',
  secondary:
  'bg-white text-burgundy border border-burgundy/30 hover:bg-burgundy-light active:bg-burgundy-light disabled:text-burgundy/40 disabled:border-burgundy/10',
  ghost: 'bg-transparent text-ink hover:bg-neutral active:bg-border/60 disabled:text-muted',
  destructive: 'bg-danger text-white hover:bg-danger/90 active:bg-danger/90 disabled:bg-danger/40',
  link: 'bg-transparent text-burgundy underline-offset-4 hover:underline p-0 h-auto'
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-base gap-2 rounded-xl'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  },
  ref) =>
  {
    return (
      <button
        ref={ref}
        aria-busy={isLoading}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed',
          variant !== 'link' && sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}>
        
        {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>);

  }
);
Button.displayName = 'Button';
