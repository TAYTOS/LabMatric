import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ChevronRightIcon, MapPinIcon, UserRoundIcon } from 'lucide-react';
import { LabGroup } from '../types';
import { getAvailabilityMeta, getAvailabilityStatus } from '../utils/availability';
import { Badge } from './StatusBadge';
import { CapacityIndicator } from './CapacityIndicator';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface LabGroupCardProps {
  courseId: string;
  group: LabGroup;
  className?: string;
}

export function LabGroupCard({ courseId, group, className }: LabGroupCardProps) {
  const navigate = useNavigate();
  const status = getAvailabilityStatus(group);
  const meta = getAvailabilityMeta(status);

  return (
    <article className={cn('flex flex-col gap-3.5 rounded-2xl border border-border bg-white p-4 shadow-card', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">{group.name}</h3>
        <Badge tone={status === 'disponible' ? 'success' : status === 'pocas' ? 'warning' : 'danger'} dotOnly>
          {meta.label}
        </Badge>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted">
        <span className="flex items-center gap-2">
          <UserRoundIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {group.instructor}
        </span>
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {group.day}, {group.startTime}–{group.endTime}
        </span>
        <span className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {group.room}
        </span>
      </div>
      <CapacityIndicator group={group} />
      <Button
        variant="secondary"
        size="sm"
        rightIcon={<ChevronRightIcon className="h-4 w-4" />}
        onClick={() => navigate(`/cursos/${courseId}/grupos/${group.id}`)}>
        
        Ver detalle
      </Button>
    </article>);

}