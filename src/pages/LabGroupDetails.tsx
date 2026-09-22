import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangleIcon, CalendarIcon, ClockIcon, HeartIcon, ListChecksIcon, MapPinIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { CapacityIndicator } from '../components/CapacityIndicator';
import { Badge } from '../components/StatusBadge';
import { Button } from '../components/ui/Button';
import { EnrollmentSheet } from '../components/EnrollmentSheet';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { getAvailabilityMeta, getAvailabilityStatus, getAvailableSeats } from '../utils/availability';
import { hasScheduleConflict } from '../utils/schedule';
import { formatDate } from '../utils/schedule';
import { useToast } from '../contexts/ToastContext';

export function LabGroupDetails() {
  const { courseId, groupId } = useParams<{courseId: string;groupId: string;}>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCourseById, getGroupById, getEnrollmentsForStudent, getGroupsForCourse, getWaitlistEntry, isFavorite, joinGroupWaitlist, leaveGroupWaitlist, toggleFavorite } = useEnrollment();
  const { showToast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);

  const course = courseId ? getCourseById(courseId) : undefined;
  const group = groupId ? getGroupById(groupId) : undefined;

  const conflict = useMemo(() => {
    if (!user || !group) return null;
    const active = getEnrollmentsForStudent(user.id).filter((e) => e.status === 'activa' || e.status === 'pendiente');
    for (const e of active) {
      const otherGroup = getGroupsForCourse(e.courseId).find((g) => g.id === e.groupId);
      if (otherGroup && otherGroup.id !== group.id && hasScheduleConflict(otherGroup, group)) {
        const otherCourse = getCourseById(e.courseId);
        return { course: otherCourse?.name ?? 'otro curso', group: otherGroup.name };
      }
    }
    return null;
  }, [user, group, getEnrollmentsForStudent, getGroupsForCourse, getCourseById]);

  if (!course || !group || group.courseId !== course.id) return <Navigate to="/cursos" replace />;

  const status = getAvailabilityStatus(group);
  const meta = getAvailabilityMeta(status);
  const availableSeats = getAvailableSeats(group);
  const isFull = availableSeats <= 0;
  const waitlistEntry = user ? getWaitlistEntry(user.id, group.id) : undefined;
  const favorite = user ? isFavorite(user.id, group.id) : false;

  const handleFavorite = () => {
    toggleFavorite(group.id);
    showToast(favorite ? 'Grupo eliminado de tus favoritos.' : 'Grupo guardado en tus favoritos.', 'success');
  };
  const handleWaitlist = () => {
    if (waitlistEntry) {
      leaveGroupWaitlist(group.id);
      showToast('Saliste de la lista de espera.', 'success');
      return;
    }
    joinGroupWaitlist(group.id);
    showToast('Te agregamos a la lista de espera simulada.', 'success');
  };

  return (
    <AppShell title={group.name} showBack onBack={() => navigate(`/cursos/${course.id}`)}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{course.name}</p>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">{group.name}</h1>
            <Badge tone={status === 'disponible' ? 'success' : status === 'pocas' ? 'warning' : 'danger'} dotOnly>
              {meta.label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-burgundy text-sm font-bold text-white">
            {group.instructor.
            replace('Ing.', '').
            trim().
            split(' ').
            slice(0, 2).
            map((p) => p.charAt(0)).
            join('')}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{group.instructor}</p>
            <p className="text-xs text-muted">Jefe de práctica</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={CalendarIcon} label="Día y horario" value={`${group.day}, ${group.startTime}–${group.endTime}`} />
          <InfoRow icon={MapPinIcon} label="Laboratorio" value={group.room} />
          <InfoRow icon={ClockIcon} label="Plazo de matrícula" value={formatDate(group.deadline)} />
          <InfoRow icon={ListChecksIcon} label="Capacidad" value={`${group.capacity} estudiantes`} />
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
          <CapacityIndicator group={group} />
        </div>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-base font-semibold text-ink">Temario de sesiones</h2>
          <ol className="flex flex-col gap-2">
            {group.topics.map((topic, i) =>
            <li key={topic} className="flex items-start gap-3 rounded-xl border border-border bg-white p-3.5 text-sm text-ink shadow-card">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-burgundy-light text-xs font-bold text-burgundy">
                  {i + 1}
                </span>
                {topic}
              </li>
            )}
          </ol>
        </section>

        {conflict &&
        <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3.5 text-sm text-warning">
            <AlertTriangleIcon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            Este horario se cruza con {conflict.course} ({conflict.group}), que ya tienes matriculado.
          </div>
        }

        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <Button size="lg" fullWidth disabled={isFull} onClick={() => setSheetOpen(true)} className="sm:w-auto sm:flex-1">
            {isFull ? 'Sin vacantes disponibles' : 'Matricularme'}
          </Button>
          {user?.role === 'student' && isFull && <Button size="lg" variant="secondary" fullWidth onClick={handleWaitlist} className="sm:w-auto">{waitlistEntry ? 'Salir de lista de espera' : 'Unirme a lista de espera'}</Button>}
          {user?.role === 'student' && <Button size="lg" variant="ghost" fullWidth leftIcon={<HeartIcon className={favorite ? 'h-4.5 w-4.5 fill-primary' : 'h-4.5 w-4.5'} />} onClick={handleFavorite} className="sm:w-auto">{favorite ? 'Guardado' : 'Guardar'}</Button>}
          <Button size="lg" variant="secondary" fullWidth onClick={() => navigate(`/cursos/${course.id}`)} className="sm:w-auto">
            Volver
          </Button>
        </div>
      </div>

      <EnrollmentSheet open={sheetOpen} onClose={() => setSheetOpen(false)} course={course} group={group} />
    </AppShell>);

}

function InfoRow({
  icon: Icon,
  label,
  value




}: {icon: React.ComponentType<{className?: string;}>;label: string;value: string;}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-white p-3.5 shadow-card">
      <Icon className="h-4.5 w-4.5 text-burgundy" aria-hidden="true" />
      <p className="text-sm font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>);

}
