import { cn } from "../utils/cn";
import { LucideIcon } from "lucide-react";
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-burgundy-light">
        <Icon className="h-8 w-8 text-burgundy" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {actionLabel && onAction && <button type="button" onClick={onAction} className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-burgundy px-5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-burgundy-dark">
          {actionLabel}
        </button>}
    </div>;
}