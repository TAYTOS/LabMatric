import { CalendarDaysIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { ScheduleGrid } from '../components/calendar/ScheduleGrid';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollment } from '../contexts/EnrollmentContext';

export function WeeklySchedule() {
  const { user } = useAuth();
  const { getCourseById, getGroupById, getEnrollmentsForStudent } = useEnrollment();
  const items = user ? getEnrollmentsForStudent(user.id)
    .filter((enrollment) => enrollment.status === 'activa' || enrollment.status === 'pendiente')
    .flatMap((enrollment) => {
      const course = getCourseById(enrollment.courseId);
      const group = getGroupById(enrollment.groupId);
      return course && group ? [{ course, group }] : [];
    }) : [];

  return (
    <AppShell title="Horario semanal" wide>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm text-muted">Vista consolidada de tus grupos activos y pendientes.</p>
        </div>
        {items.length === 0 ? <EmptyState icon={CalendarDaysIcon} title="Todavía no tienes horarios" description="Cuando confirmes una matrícula, aparecerá en este calendario semanal." className="rounded-2xl border border-border bg-white" /> : <ScheduleGrid items={items} />}
      </div>
    </AppShell>
  );
}
