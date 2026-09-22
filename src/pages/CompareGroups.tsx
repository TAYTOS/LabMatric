import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { GroupComparison } from '../components/courses/GroupComparison';
import { useEnrollment } from '../contexts/EnrollmentContext';

export function CompareGroups() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { getCourseById, getGroupsForCourse } = useEnrollment();
  const course = courseId ? getCourseById(courseId) : undefined;
  if (!course) return <Navigate to="/cursos" replace />;
  const groups = getGroupsForCourse(course.id);
  return (
    <AppShell title="Comparar grupos" showBack onBack={() => navigate(`/cursos/${course.id}`)} wide>
      <div className="flex flex-col gap-5">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-muted">{course.code}</p><h1 className="text-xl font-bold text-ink">{course.name}</h1></div>
        <p className="text-sm text-muted">Compara horarios, docentes, laboratorios y vacantes antes de elegir un grupo.</p>
        <GroupComparison groups={groups} />
      </div>
    </AppShell>
  );
}
