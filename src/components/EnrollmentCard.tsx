import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, MoreVerticalIcon, UserRoundIcon, XCircleIcon } from 'lucide-react';
import { Course, Enrollment, LabGroup } from '../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/Button';
import { formatDate } from '../utils/schedule';
import { cn } from '../utils/cn';

interface EnrollmentCardProps {
  enrollment: Enrollment;
  course: Course;
  group: LabGroup;
  onCancel?: () => void;
  className?: string;
}

export function EnrollmentCard({ enrollment, course, group, onCancel, className }: EnrollmentCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canCancel = enrollment.status === 'activa' || enrollment.status === 'pendiente';

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <article className={cn('flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-card', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink">{course.name}</p>
          <p className="text-xs text-muted">{group.name} · {enrollment.code}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <StatusBadge status={enrollment.status} />
          {canCancel &&
          <div className="relative" ref={menuRef}>
              <button
              type="button"
              aria-label="Más opciones"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-neutral hover:text-ink">
              
                <MoreVerticalIcon className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
              {menuOpen &&
            <div
              role="menu"
              className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-floating animate-scale-in">
              
                  <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onCancel?.();
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger/5">
                
                    <XCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Cancelar matrícula
                  </button>
                </div>
            }
            </div>
          }
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-muted">
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-xs text-muted">Matriculado el {formatDate(enrollment.enrollmentDate)}</span>
        <Button size="sm" variant="secondary" onClick={() => navigate(`/matriculas/${enrollment.id}`)}>
          Ver detalle
        </Button>
      </div>
    </article>);

}