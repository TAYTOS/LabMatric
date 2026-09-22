import { UsersIcon } from 'lucide-react';
import { LabGroup } from '../types';
import { getAvailabilityMeta, getAvailabilityStatus, getAvailableSeats } from '../utils/availability';
import { cn } from '../utils/cn';

export function CapacityIndicator({
  group,
  className



}: {group: Pick<LabGroup, 'capacity' | 'enrolled'>;className?: string;}) {
  const status = getAvailabilityStatus(group);
  const meta = getAvailabilityMeta(status);
  const available = getAvailableSeats(group);
  const percentFilled = group.capacity > 0 ? Math.min(100, Math.round(group.enrolled / group.capacity * 100)) : 0;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted">
          <UsersIcon className="h-4 w-4" aria-hidden="true" />
          {group.enrolled}/{group.capacity} matriculados
        </span>
        <span className={cn('font-semibold', meta.textClass)}>
          {available > 0 ? `${available} disponibles` : 'Sin cupos'}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-border/70"
        role="progressbar"
        aria-valuenow={percentFilled}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Capacidad del grupo">
        
        <div
          className={cn('h-full rounded-full transition-[width] duration-300 ease-out', meta.barClass)}
          style={{ width: `${percentFilled}%` }} />
        
      </div>
    </div>);

}