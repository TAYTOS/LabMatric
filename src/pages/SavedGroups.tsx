import { BookmarkIcon, Clock3Icon, HeartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollment } from '../contexts/EnrollmentContext';

export function SavedGroups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCourseById, getFavoritesForStudent, getGroupById, getWaitlistEntry, leaveGroupWaitlist, toggleFavorite, waitlist } = useEnrollment();
  if (!user) return null;
  const favoriteGroups = getFavoritesForStudent(user.id).flatMap((favorite) => {
    const group = getGroupById(favorite.groupId);
    const course = group ? getCourseById(group.courseId) : undefined;
    return group && course ? [{ group, course }] : [];
  });
  const standaloneWaitlistGroups = waitlist
    .filter((entry) => entry.studentId === user.id && entry.status !== 'removed' && !favoriteGroups.some(({ group }) => group.id === entry.groupId))
    .flatMap((entry) => {
      const group = getGroupById(entry.groupId);
      const course = group ? getCourseById(group.courseId) : undefined;
      return group && course ? [{ group, course }] : [];
    });
  const groups = [...favoriteGroups, ...standaloneWaitlistGroups];
  return (
    <AppShell title="Guardados" wide>
      <div className="flex flex-col gap-5">
        <div><p className="text-sm text-muted">Tus grupos favoritos y solicitudes de lista de espera se guardan solo en este dispositivo.</p></div>
        {groups.length === 0 ? <EmptyState icon={BookmarkIcon} title="Aún no guardaste grupos" description="Guarda un grupo para compararlo más tarde o únete a la lista de espera cuando esté lleno." actionLabel="Explorar cursos" onAction={() => navigate('/cursos')} className="rounded-2xl border border-border bg-white" /> : <div className="grid gap-3 md:grid-cols-2">
          {groups.map(({ course, group }) => {
            const waitlistEntry = getWaitlistEntry(user.id, group.id);
            const isFavorite = favoriteGroups.some((item) => item.group.id === group.id);
            return <article key={group.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted">{course.code}</p><h2 className="text-base font-bold text-ink">{course.name}</h2><p className="text-sm text-muted">{group.name} · {group.day}, {group.startTime}</p></div>{isFavorite && <HeartIcon className="h-5 w-5 fill-primary text-primary" aria-label="Grupo favorito" />}</div>
              {waitlistEntry && <p className="flex items-center gap-2 rounded-xl bg-primary-light p-3 text-sm text-primary"><Clock3Icon className="h-4 w-4" />{waitlistEntry.status === 'notified' ? 'Hay una vacante disponible para ti.' : 'Estás en lista de espera simulada.'}</p>}
              <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => navigate(`/cursos/${course.id}/grupos/${group.id}`)}>Ver grupo</Button>{isFavorite && <Button size="sm" variant="secondary" onClick={() => toggleFavorite(group.id)}>Quitar favorito</Button>}{waitlistEntry && <Button size="sm" variant="ghost" onClick={() => leaveGroupWaitlist(group.id)}>Salir de lista</Button>}</div>
            </article>;
          })}
        </div>}
      </div>
    </AppShell>
  );
}
