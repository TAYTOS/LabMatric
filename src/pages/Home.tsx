import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  BookOpenCheckIcon,
  CalendarClockIcon,
  ClipboardCheckIcon,
  ClockIcon,
  MapPinIcon } from
'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { SearchBar } from '../components/SearchBar';
import { CourseCard } from '../components/CourseCard';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { getAvailableSeats } from '../utils/availability';
import { formatDate } from '../utils/schedule';
import { notificationIconFor } from '../utils/notificationMeta';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, groups, getEnrollmentsForStudent, getCourseById, getGroupById, notifications } = useEnrollment();
  const [query, setQuery] = useState('');

  const enrollments = user ? getEnrollmentsForStudent(user.id) : [];
  const activeEnrollments = enrollments.filter((e) => e.status === 'activa' || e.status === 'pendiente');
  const coursesWithAvailability = courses.filter((c) =>
  groups.some((g) => g.courseId === c.id && getAvailableSeats(g) > 0)
  );

  const weeklyHours = useMemo(() => {
    return activeEnrollments.reduce((sum, e) => {
      const group = getGroupById(e.groupId);
      if (!group) return sum;
      const [sh, sm] = group.startTime.split(':').map(Number);
      const [eh, em] = group.endTime.split(':').map(Number);
      return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
    }, 0);
  }, [activeEnrollments, getGroupById]);

  const importantNotifications = notifications.slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/cursos${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <AppShell wide>
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-ink md:text-2xl">
              {getGreeting()}, {user?.names.split(' ')[0]}
            </h1>
            <span className="rounded-full bg-burgundy-light px-3 py-1 text-xs font-semibold text-burgundy">
              Periodo {user?.period}
            </span>
          </div>
          <p className="text-sm text-muted">{user?.program} · {user?.semester}</p>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar cursos o laboratorios" />
        </form>

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard icon={BookOpenCheckIcon} label="Cursos disponibles" value={coursesWithAvailability.length} />
          <SummaryCard icon={ClipboardCheckIcon} label="Matrículas activas" value={activeEnrollments.length} />
          <SummaryCard icon={ClockIcon} label="Horas de laboratorio" value={`${weeklyHours}h`} />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Matrículas próximas</h2>
            <button onClick={() => navigate('/matriculas')} className="text-sm font-semibold text-burgundy hover:underline">
              Ver todas
            </button>
          </div>
          {activeEnrollments.length === 0 ?
          <EmptyState
            icon={CalendarClockIcon}
            title="Sin matrículas próximas"
            description="Explora los cursos disponibles y matricúlate en un laboratorio."
            actionLabel="Explorar cursos"
            onAction={() => navigate('/cursos')}
            className="rounded-2xl border border-border bg-white py-10" /> :


          <div className="flex flex-col gap-3">
              {activeEnrollments.map((enrollment) => {
              const course = getCourseById(enrollment.courseId);
              const group = getGroupById(enrollment.groupId);
              if (!course || !group) return null;
              return (
                <button
                  key={enrollment.id}
                  onClick={() => navigate(`/matriculas/${enrollment.id}`)}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 text-left shadow-card transition-shadow duration-150 hover:shadow-floating">
                  
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[15px] font-semibold text-ink">{course.name}</p>
                        <p className="text-xs text-muted">{group.name} · {group.instructor}</p>
                      </div>
                      <StatusBadge status={enrollment.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <CalendarClockIcon className="h-3.5 w-3.5" />
                        {group.day}, {group.startTime}–{group.endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {group.room}
                      </span>
                    </div>
                  </button>);

            })}
            </div>
          }
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Cursos disponibles</h2>
            <button
              onClick={() => navigate('/cursos')}
              className="flex items-center gap-1 text-sm font-semibold text-burgundy hover:underline">
              
              Explorar cursos
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) =>
            <CourseCard
              key={course.id}
              course={course}
              groups={groups.filter((g) => g.courseId === course.id)}
              compact
              className="w-full min-w-0" />

            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">Avisos importantes</h2>
          <div className="flex flex-col gap-2.5">
            {importantNotifications.map((notification) => {
              const Icon = notificationIconFor(notification.type);
              return (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-white p-3.5 shadow-card">
                  
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-burgundy-light">
                    <Icon className="h-4.5 w-4.5 text-burgundy" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{notification.title}</p>
                    <p className="text-sm text-muted">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(notification.date)}</p>
                  </div>
                  {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-burgundy" aria-hidden="true" />}
                </div>);

            })}
          </div>
          <Button variant="link" onClick={() => navigate('/notificaciones')} className="self-start text-sm">
            Ver todos los avisos
          </Button>
        </section>
      </div>
    </AppShell>);

}

function SummaryCard({
  icon: Icon,
  label,
  value




}: {icon: React.ComponentType<{className?: string;}>;label: string;value: string | number;}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-3.5 shadow-card">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-light">
        <Icon className="h-4.5 w-4.5 text-burgundy" />
      </div>
      <p className="text-lg font-bold leading-none text-ink">{value}</p>
      <p className="text-xs leading-tight text-muted">{label}</p>
    </div>);

}