import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarkIcon, CalendarDaysIcon, ClipboardListIcon, DownloadIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { EnrollmentCard } from '../components/EnrollmentCard';
import { EmptyState } from '../components/EmptyState';
import { EnrollmentCardSkeleton } from '../components/LoadingSkeleton';
import { CancelEnrollmentDialog } from '../components/CancelEnrollmentDialog';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { Enrollment } from '../types';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/Button';
import { downloadPdf, enrollmentHistoryPdf } from '../services/pdfService';

type TabKey = 'activas' | 'pendientes' | 'historial';

const TABS: {key: TabKey;label: string;}[] = [
{ key: 'activas', label: 'Activas' },
{ key: 'pendientes', label: 'Pendientes' },
{ key: 'historial', label: 'Historial' }];


export function MyEnrollments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEnrollmentsForStudent, getCourseById, getGroupById, syncActions } = useEnrollment();
  const [tab, setTab] = useState<TabKey>('activas');
  const [cancelTarget, setCancelTarget] = useState<Enrollment | null>(null);

  const enrollments = user ? getEnrollmentsForStudent(user.id) : [];
  const filtered = enrollments.filter((e) => {
    if (tab === 'activas') return e.status === 'activa';
    if (tab === 'pendientes') return e.status === 'pendiente';
    return e.status === 'cancelada' || e.status === 'completada';
  });

  const cancelCourse = cancelTarget ? getCourseById(cancelTarget.courseId) : undefined;
  const cancelGroup = cancelTarget ? getGroupById(cancelTarget.groupId) : undefined;
  const studentSyncActions = user ? syncActions.filter((action) => action.studentId === user.id && action.status !== 'applied') : [];
  const exportHistory = async () => {
    if (!user) return;
    const entries = enrollments.flatMap((enrollment) => {
      const course = getCourseById(enrollment.courseId);
      const group = getGroupById(enrollment.groupId);
      return course && group ? [{ enrollment, course, group }] : [];
    });
    downloadPdf(await enrollmentHistoryPdf(user, entries), `historial-matriculas-${user.studentCode}.pdf`);
  };

  return (
    <AppShell title="Mis matrículas" wide>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => navigate('/guardados')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><BookmarkIcon className="h-4 w-4" />Guardados</button><button type="button" onClick={() => navigate('/calendario')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><CalendarDaysIcon className="h-4 w-4" />Ver horario</button><Button variant="ghost" size="sm" leftIcon={<DownloadIcon className="h-4 w-4" />} onClick={() => void exportHistory()}>Exportar historial en PDF</Button></div>
        {studentSyncActions.length > 0 && <section aria-label="Estado de sincronización" className="rounded-2xl border border-primary/30 bg-primary-light p-4"><p className="text-sm font-semibold text-primary">{studentSyncActions.filter((action) => action.status === 'pending').length} solicitud(es) pendiente(s) de sincronización</p>{studentSyncActions.some((action) => action.status === 'rejected') && <p className="mt-1 text-sm text-ink">Una solicitud ya no cumplió las reglas al recuperar conexión. Revisa los grupos disponibles.</p>}</section>}
        <div role="tablist" aria-label="Filtrar matrículas" className="flex gap-1 rounded-xl bg-white p-1 shadow-card">
          {TABS.map((t) =>
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out',
              tab === t.key ? 'bg-burgundy text-white' : 'text-muted hover:text-ink'
            )}>
            
              {t.label}
            </button>
          )}
        </div>

        {!user ?
        <div className="flex flex-col gap-3">
            <EnrollmentCardSkeleton />
            <EnrollmentCardSkeleton />
          </div> :
        filtered.length === 0 ?
        <EmptyState
          icon={ClipboardListIcon}
          title={tab === 'historial' ? 'Sin historial de matrículas' : 'Todavía no tienes matrículas'}
          description={
          tab === 'historial' ?
          'Aquí aparecerán tus matrículas canceladas o completadas.' :
          'Explora los cursos disponibles y matricúlate en un laboratorio.'
          }
          actionLabel="Explorar cursos"
          onAction={() => navigate('/cursos')}
          className="rounded-2xl border border-border bg-white" /> :


        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
            {filtered.map((enrollment) => {
            const course = getCourseById(enrollment.courseId);
            const group = getGroupById(enrollment.groupId);
            if (!course || !group) return null;
            return (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                course={course}
                group={group}
                onCancel={() => setCancelTarget(enrollment)} />);


          })}
          </div>
        }
      </div>

      {cancelTarget && cancelCourse && cancelGroup &&
      <CancelEnrollmentDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        enrollment={cancelTarget}
        course={cancelCourse}
        group={cancelGroup} />

      }
    </AppShell>);

}
