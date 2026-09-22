import { CalendarDaysIcon, FlaskConicalIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: 'h-8 w-8', icon: 'h-4.5 w-4.5', text: 'text-sm' },
  md: { box: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-base' },
  lg: { box: 'h-16 w-16', icon: 'h-8 w-8', text: 'text-2xl' }
};

export function Logo({ size = 'md', showWordmark = true, className }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('relative flex shrink-0 items-center justify-center rounded-xl bg-primary', s.box)}>
        <FlaskConicalIcon className={cn('text-white', s.icon)} aria-hidden="true" />
        <CalendarDaysIcon className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded bg-accent p-0.5 text-white" aria-hidden="true" />
      </div>
      {showWordmark &&
      <span className={cn('font-bold leading-none text-ink', s.text)}>
          Lab<span className="text-primary">Matric</span>
        </span>
      }
    </div>);

}
