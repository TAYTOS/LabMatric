import React from 'react';
import { CheckCircle2Icon, ClockIcon, XCircleIcon, BadgeCheckIcon, CircleIcon } from 'lucide-react';
import { EnrollmentStatus } from '../types';
import { cn } from '../utils/cn';

const statusConfig: Record<
  EnrollmentStatus,
  {label: string;textClass: string;bgClass: string;icon: React.ComponentType<{className?: string;}>;}> =
{
  activa: { label: 'Activa', textClass: 'text-success', bgClass: 'bg-success/10', icon: CheckCircle2Icon },
  pendiente: { label: 'Pendiente', textClass: 'text-warning', bgClass: 'bg-warning/10', icon: ClockIcon },
  cancelada: { label: 'Cancelada', textClass: 'text-danger', bgClass: 'bg-danger/10', icon: XCircleIcon },
  completada: { label: 'Completada', textClass: 'text-muted', bgClass: 'bg-neutral', icon: BadgeCheckIcon }
};

export function StatusBadge({ status, className }: {status: EnrollmentStatus;className?: string;}) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        config.textClass,
        config.bgClass,
        className
      )}>
      
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>);

}

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'burgundy';

const toneClasses: Record<BadgeTone, string> = {
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  danger: 'text-danger bg-danger/10',
  neutral: 'text-muted bg-neutral',
  burgundy: 'text-burgundy bg-burgundy-light'
};

export function Badge({
  tone = 'neutral',
  children,
  className,
  dotOnly = false





}: {tone?: BadgeTone;children: React.ReactNode;className?: string;dotOnly?: boolean;}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClasses[tone],
        className
      )}>
      
      {dotOnly && <CircleIcon className="h-2 w-2 fill-current" aria-hidden="true" />}
      {children}
    </span>);

}