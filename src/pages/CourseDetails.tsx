import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AwardIcon, Columns3Icon, GraduationCapIcon, LayersIcon, UserRoundIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { LabGroupCard } from '../components/LabGroupCard';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { Button } from '../components/ui/Button';

export function CourseDetails() {
  const navigate = useNavigate();
  const { courseId } = useParams<{courseId: string;}>();
  const { getCourseById, getGroupsForCourse } = useEnrollment();
  const course = courseId ? getCourseById(courseId) : undefined;

  if (!course) return <Navigate to="/cursos" replace />;

  const courseGroups = getGroupsForCourse(course.id);

  return (
    <AppShell title="Detalle del curso" showBack onBack={() => navigate('/cursos')}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Código {course.code}</p>
          <h1 className="text-xl font-bold text-ink md:text-2xl">{course.name}</h1>
          <p className="text-sm leading-relaxed text-muted">{course.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoTile icon={AwardIcon} label="Créditos" value={String(course.credits)} />
          <InfoTile icon={GraduationCapIcon} label="Semestre" value={course.semester} />
          <InfoTile icon={LayersIcon} label="Grupos" value={String(courseGroups.length)} />
          <InfoTile icon={UserRoundIcon} label="Docente titular" value={course.instructor} small />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold text-ink">Grupos disponibles</h2>{courseGroups.length > 1 && <Button variant="secondary" size="sm" leftIcon={<Columns3Icon className="h-4 w-4" />} onClick={() => navigate(`/cursos/${course.id}/comparar`)}>Comparar grupos</Button>}</div>
          {courseGroups.length === 0 && <p className="rounded-xl border border-border bg-white p-4 text-sm text-muted">Aún no hay grupos publicados para este curso.</p>}
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
            {courseGroups.map((group) =>
            <LabGroupCard key={group.id} courseId={course.id} group={group} />
            )}
          </div>
        </section>
      </div>
    </AppShell>);

}

function InfoTile({
  icon: Icon,
  label,
  value,
  small = false





}: {icon: React.ComponentType<{className?: string;}>;label: string;value: string;small?: boolean;}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-white p-3.5 shadow-card">
      <Icon className="h-4.5 w-4.5 text-burgundy" aria-hidden="true" />
      <p className={small ? 'text-sm font-semibold text-ink' : 'text-base font-bold text-ink'}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>);

}
