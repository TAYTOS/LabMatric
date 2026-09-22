import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, ChevronRightIcon, LayersIcon, UsersIcon } from 'lucide-react';
import { Course, LabGroup } from '../types';
import { getAvailableSeats } from '../utils/availability';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';
import { SearchHighlight } from './courses/SearchHighlight';

interface CourseCardProps {
  course: Course;
  groups: LabGroup[];
  className?: string;
  compact?: boolean;
  searchQuery?: string;
}

export function CourseCard({ course, groups, className, compact = false, searchQuery = '' }: CourseCardProps) {
  const navigate = useNavigate();
  const totalAvailable = groups.reduce((sum, g) => sum + getAvailableSeats(g), 0);
  const hasAvailability = totalAvailable > 0;

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-card transition-shadow duration-150 ease-out hover:shadow-floating',
        compact && 'w-64 shrink-0',
        className
      )}>
      
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-burgundy-light">
          <BookOpenIcon className="h-6 w-6 text-burgundy" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Código <SearchHighlight text={course.code} query={searchQuery} /></p>
          <h3 className="text-[15px] font-semibold text-ink"><SearchHighlight text={course.name} query={searchQuery} /></h3>
        </div>
      </div>
      <p className={cn('text-sm text-muted', compact ? 'line-clamp-2' : 'line-clamp-2')}>{course.description}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <LayersIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {groups.length} grupos de laboratorio
        </span>
        <span className={cn('flex items-center gap-1.5 font-semibold', hasAvailability ? 'text-success' : 'text-danger')}>
          <UsersIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {hasAvailability ? `${totalAvailable} vacantes disponibles` : 'Sin vacantes disponibles'}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-xs font-medium text-muted">
          {course.semester} semestre · {course.credits} créditos
        </span>
        <Button size="sm" variant="secondary" rightIcon={<ChevronRightIcon className="h-4 w-4" />} onClick={() => navigate(`/cursos/${course.id}`)}>
          Ver grupos
        </Button>
      </div>
    </article>);

}
