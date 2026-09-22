import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  ClipboardListIcon,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UsersIcon } from
'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { SearchBar } from '../components/SearchBar';
import { StatusBadge } from '../components/StatusBadge';
import { Badge } from '../components/StatusBadge';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { CourseFormSheet } from '../components/admin/CourseFormSheet';
import { GroupFormSheet } from '../components/admin/GroupFormSheet';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { Course, LabGroup } from '../types';
import { getAvailabilityMeta, getAvailabilityStatus, getAvailableSeats } from '../utils/availability';
import { formatDate } from '../utils/schedule';
import { cn } from '../utils/cn';

type TabKey = 'resumen' | 'cursos' | 'grupos' | 'matriculas';
const TABS: {key: TabKey;label: string;}[] = [
{ key: 'resumen', label: 'Resumen' },
{ key: 'cursos', label: 'Cursos' },
{ key: 'grupos', label: 'Grupos' },
{ key: 'matriculas', label: 'Matrículas' }];




export function AdminDashboard() {
  const navigate = useNavigate();
  const { courses, groups, enrollments, getCourseById, getGroupById, addCourse, updateCourse, deleteCourse, addGroup, updateGroup, deleteGroup, cancelEnrollment } =
  useEnrollment();

  const [tab, setTab] = useState<TabKey>('resumen');

  const availableGroups = groups.filter((g) => getAvailableSeats(g) > 0).length;

  return (
    <AppShell title="Panel de administración" wide>
      <div className="flex flex-col gap-5">
        <div role="tablist" aria-label="Secciones del panel" className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-card no-scrollbar">
          {TABS.map((t) =>
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out',
              tab === t.key ? 'bg-burgundy text-white' : 'text-muted hover:text-ink'
            )}>
            
              {t.label}
            </button>
          )}
        </div>

        {tab === 'resumen' &&
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard icon={UsersIcon} label="Estudiantes con registros" value={new Set(enrollments.map((e) => e.studentId)).size} />
              <StatCard icon={BookOpenIcon} label="Cursos activos" value={courses.length} />
              <StatCard icon={LayersIcon} label="Grupos disponibles" value={`${availableGroups}/${groups.length}`} />
              <StatCard icon={ClipboardListIcon} label="Total de matrículas" value={enrollments.length} />
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
              <h2 className="mb-3 text-base font-semibold text-ink">Grupos con menor disponibilidad</h2>
              <div className="flex flex-col gap-2">
                {[...groups].
              sort((a, b) => getAvailableSeats(a) - getAvailableSeats(b)).
              slice(0, 4).
              map((g) => {
                const course = getCourseById(g.courseId);
                const status = getAvailabilityStatus(g);
                const meta = getAvailabilityMeta(status);
                return (
                  <div key={g.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{course?.name} · {g.name}</p>
                          <p className="text-xs text-muted">{g.day}, {g.startTime}–{g.endTime}</p>
                        </div>
                        <Badge tone={status === 'disponible' ? 'success' : status === 'pocas' ? 'warning' : 'danger'}>
                          {meta.label}
                        </Badge>
                      </div>);

              })}
              </div>
            </div>
          </div>
        }

        {tab === 'cursos' &&
        <CoursesTab
          courses={courses}
          groups={groups}
          onAdd={addCourse}
          onUpdate={updateCourse}
          onDelete={deleteCourse} />

        }

        {tab === 'grupos' &&
        <GroupsTab
          courses={courses}
          groups={groups}
          getCourseById={getCourseById}
          onAdd={addGroup}
          onUpdate={updateGroup}
          onDelete={deleteGroup} />

        }

        {tab === 'matriculas' &&
        <EnrollmentsTab
          enrollments={enrollments}
          getCourseById={getCourseById}
          getGroupById={getGroupById}
          onCancel={cancelEnrollment}
          onView={(id) => navigate(`/matriculas/${id}`)} />

        }
      </div>
    </AppShell>);

}

function StatCard({ icon: Icon, label, value }: {icon: React.ComponentType<{className?: string;}>;label: string;value: string | number;}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 shadow-card">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-light">
        <Icon className="h-4.5 w-4.5 text-burgundy" />
      </div>
      <p className="text-xl font-bold leading-none text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>);

}

function CoursesTab({
  courses,
  groups,
  onAdd,
  onUpdate,
  onDelete






}: {courses: Course[];groups: LabGroup[];onAdd: ReturnType<typeof useEnrollment>['addCourse'];onUpdate: ReturnType<typeof useEnrollment>['updateCourse'];onDelete: ReturnType<typeof useEnrollment>['deleteCourse'];}) {
  const { enrollments } = useEnrollment();
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | undefined>(undefined);
  const [deleting, setDeleting] = useState<Course | null>(null);

  const filtered = courses.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.includes(query)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar curso por nombre o código" className="sm:max-w-sm" />
        <Button leftIcon={<PlusIcon className="h-4.5 w-4.5" />} onClick={() => {setEditing(undefined);setFormOpen(true);}}>
          Nuevo curso
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
        <table className="responsive-table w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-neutral text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Curso</th>
              <th className="px-4 py-3">Semestre</th>
              <th className="px-4 py-3">Créditos</th>
              <th className="px-4 py-3">Grupos</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((course) =>
            <tr key={course.id} className="border-b border-border last:border-0">
                <td data-label="Codigo" className="px-4 py-3 font-medium text-ink">{course.code}</td>
                <td data-label="Curso" className="px-4 py-3 text-ink">{course.name}</td>
                <td data-label="Semestre" className="px-4 py-3 text-muted">{course.semester}</td>
                <td data-label="Creditos" className="px-4 py-3 text-muted">{course.credits}</td>
                <td data-label="Grupos" className="px-4 py-3 text-muted">{groups.filter((g) => g.courseId === course.id).length}</td>
                <td data-label="Acciones" className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <RowIconButton icon={PencilIcon} label={`Editar ${course.name}`} onClick={() => {setEditing(course);setFormOpen(true);}} />
                    <RowIconButton icon={Trash2Icon} label={`Eliminar ${course.name}`} danger disabled={enrollments.some((e) => e.courseId === course.id)} onClick={() => setDeleting(course)} />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted">No se encontraron cursos.</p>}
      </div>

      <CourseFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSubmit={(input) => editing ? onUpdate(editing.id, input) : onAdd(input)} />
      <p className="text-xs text-muted">Los cursos con matrículas registradas no se pueden eliminar, para conservar su historial.</p>
      

      {deleting &&
      <ConfirmationDialog
        open={!!deleting}
        title="Eliminar curso"
        message={`Se eliminará "${deleting.name}" y todos sus grupos de laboratorio sin matrículas registradas.`}
        icon={TriangleAlertIcon}
        tone="danger"
        confirmLabel="Sí, eliminar curso"
        cancelLabel="Cancelar"
        onConfirm={() => {onDelete(deleting.id);setDeleting(null);}}
        onCancel={() => setDeleting(null)} />

      }
    </div>);

}

function GroupsTab({
  courses,
  groups,
  getCourseById,
  onAdd,
  onUpdate,
  onDelete







}: {courses: Course[];groups: LabGroup[];getCourseById: ReturnType<typeof useEnrollment>['getCourseById'];onAdd: ReturnType<typeof useEnrollment>['addGroup'];onUpdate: ReturnType<typeof useEnrollment>['updateGroup'];onDelete: ReturnType<typeof useEnrollment>['deleteGroup'];}) {
  const { enrollments } = useEnrollment();
  const [courseFilter, setCourseFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LabGroup | undefined>(undefined);
  const [deleting, setDeleting] = useState<LabGroup | null>(null);

  const filtered = courseFilter === 'all' ? groups : groups.filter((g) => g.courseId === courseFilter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          aria-label="Filtrar grupos por curso"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-ink focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/30 sm:max-w-xs">
          
          <option value="all">Todos los cursos</option>
          {courses.map((c) =>
          <option key={c.id} value={c.id}>
              {c.name}
            </option>
          )}
        </select>
        <Button
          leftIcon={<PlusIcon className="h-4.5 w-4.5" />}
          disabled={courseFilter === 'all'}
          onClick={() => {setEditing(undefined);setFormOpen(true);}}>
          
          Nuevo grupo
        </Button>
      </div>
      {courseFilter === 'all' && <p className="text-xs text-muted">Selecciona un curso para crear un nuevo grupo.</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
        <table className="responsive-table w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border bg-neutral text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Curso</th>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Horario</th>
              <th className="px-4 py-3">Aula</th>
              <th className="px-4 py-3">Capacidad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((group) => {
              const course = getCourseById(group.courseId);
              const status = getAvailabilityStatus(group);
              const meta = getAvailabilityMeta(status);
              return (
                <tr key={group.id} className="border-b border-border last:border-0">
                  <td data-label="Curso" className="px-4 py-3 text-ink">{course?.name}</td>
                  <td data-label="Grupo" className="px-4 py-3 font-medium text-ink">{group.name}</td>
                  <td data-label="Horario" className="px-4 py-3 text-muted">{group.day}, {group.startTime}–{group.endTime}</td>
                  <td data-label="Aula" className="px-4 py-3 text-muted">{group.room}</td>
                  <td data-label="Capacidad" className="px-4 py-3 text-muted">{group.enrolled}/{group.capacity}</td>
                  <td data-label="Estado" className="px-4 py-3">
                    <Badge tone={status === 'disponible' ? 'success' : status === 'pocas' ? 'warning' : 'danger'}>{meta.label}</Badge>
                  </td>
                  <td data-label="Acciones" className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <RowIconButton icon={PencilIcon} label={`Editar ${group.name}`} onClick={() => {setEditing(group);setFormOpen(true);}} />
                      <RowIconButton icon={Trash2Icon} label={`Eliminar ${group.name}`} danger disabled={enrollments.some((e) => e.groupId === group.id)} onClick={() => setDeleting(group)} />
                    </div>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted">No hay grupos para este curso.</p>}
      </div>

      <GroupFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSubmit={(input) => editing ? onUpdate(editing.id, input) : onAdd(courseFilter, input)} />
      <p className="text-xs text-muted">Los grupos con matrículas registradas no se pueden eliminar, para conservar su historial.</p>
      

      {deleting &&
      <ConfirmationDialog
        open={!!deleting}
        title="Eliminar grupo"
        message={`Se eliminará "${deleting.name}", que no tiene matrículas registradas.`}
        icon={TriangleAlertIcon}
        tone="danger"
        confirmLabel="Sí, eliminar grupo"
        cancelLabel="Cancelar"
        onConfirm={() => {onDelete(deleting.id);setDeleting(null);}}
        onCancel={() => setDeleting(null)} />

      }
    </div>);

}

function EnrollmentsTab({
  enrollments,
  getCourseById,
  getGroupById,
  onCancel,
  onView






}: {enrollments: ReturnType<typeof useEnrollment>['enrollments'];getCourseById: ReturnType<typeof useEnrollment>['getCourseById'];getGroupById: ReturnType<typeof useEnrollment>['getGroupById'];onCancel: ReturnType<typeof useEnrollment>['cancelEnrollment'];onView: (id: string) => void;}) {
  const [query, setQuery] = useState('');
  const [cancelTarget, setCancelTarget] = useState<{id: string;code: string;} | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter((e) => {
      const course = getCourseById(e.courseId);
      return e.code.toLowerCase().includes(q) || course?.name.toLowerCase().includes(q);
    });
  }, [enrollments, query, getCourseById]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    await onCancel(cancelTarget.id, 'Cancelada por administración');
    setIsCancelling(false);
    setCancelTarget(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar por código de matrícula o curso" />

      <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
        <table className="responsive-table w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-neutral text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Curso / Grupo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((enrollment) => {
              const course = getCourseById(enrollment.courseId);
              const group = getGroupById(enrollment.groupId);
              const canCancel = enrollment.status === 'activa' || enrollment.status === 'pendiente';
              return (
                <tr key={enrollment.id} className="border-b border-border last:border-0">
                  <td data-label="Codigo" className="px-4 py-3 font-medium text-ink">{enrollment.code}</td>
                  <td data-label="Curso / Grupo" className="px-4 py-3 text-ink">{course?.name} · {group?.name}</td>
                  <td data-label="Fecha" className="px-4 py-3 text-muted">{formatDate(enrollment.enrollmentDate)}</td>
                  <td data-label="Estado" className="px-4 py-3">
                    <StatusBadge status={enrollment.status} />
                  </td>
                  <td data-label="Acciones" className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onView(enrollment.id)}>
                        Ver
                      </Button>
                      {canCancel &&
                      <Button size="sm" variant="destructive" onClick={() => setCancelTarget({ id: enrollment.id, code: enrollment.code })}>
                          Cancelar
                        </Button>
                      }
                    </div>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted">No se encontraron matrículas.</p>}
      </div>

      {cancelTarget &&
      <ConfirmationDialog
        open={!!cancelTarget}
        title="Cancelar matrícula"
        message={`Se cancelará la matrícula ${cancelTarget.code} y se liberará la vacante correspondiente.`}
        icon={TriangleAlertIcon}
        tone="danger"
        confirmLabel="Sí, cancelar matrícula"
        cancelLabel="Conservar"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)} />

      }
    </div>);

}

function RowIconButton({
  icon: Icon,
  label,
  danger = false,
  disabled = false,
  onClick





}: {icon: React.ComponentType<{className?: string;}>;label: string;danger?: boolean;disabled?: boolean;onClick: () => void;}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      title={disabled ? "Conservado para mantener el historial de matrículas" : label}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150',
        danger ? 'text-danger hover:bg-danger/10' : 'text-muted hover:bg-neutral hover:text-ink'
      )}>
      
      <Icon className="h-4 w-4" />
    </button>);

}
