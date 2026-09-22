import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarIcon,
  CheckIcon,
  CircleIcon,
   DownloadIcon,
  MapPinIcon,
  MailIcon,
   Share2Icon,
   UserRoundIcon } from
'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/ui/Button';
import { CancelEnrollmentDialog } from '../components/CancelEnrollmentDialog';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { useToast } from '../contexts/ToastContext';
import { formatDate } from '../utils/schedule';
import { cn } from '../utils/cn';
import { downloadPdf, enrollmentCertificatePdf } from '../services/pdfService';
import { sharePdf } from '../services/shareService';

export function EnrollmentDetails() {
  const { enrollmentId } = useParams<{enrollmentId: string;}>();
  const navigate = useNavigate();
  const { user: viewer, getUserById } = useAuth();
  const { enrollments, getCourseById, getGroupById } = useEnrollment();
  const { showToast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);

  const enrollment = enrollments.find((e) => e.id === enrollmentId);
  if (!enrollment || !viewer || viewer.role !== 'admin' && enrollment.studentId !== viewer.id) return <Navigate to="/matriculas" replace />;

  const user = getUserById(enrollment.studentId);
  const course = getCourseById(enrollment.courseId);
  const group = getGroupById(enrollment.groupId);
  if (!course || !group || !user) return <Navigate to="/matriculas" replace />;

  const canCancel = enrollment.status === 'activa' || enrollment.status === 'pendiente';

  const handleDownload = async () => {
    downloadPdf(await enrollmentCertificatePdf(enrollment, user, course, group), `constancia-${enrollment.code}.pdf`);
    showToast('Constancia descargada correctamente.', 'success');
  };
  const handleShare = async () => {
    const result = await sharePdf(await enrollmentCertificatePdf(enrollment, user, course, group), `constancia-${enrollment.code}.pdf`, 'Constancia de matrícula LabMatric', `Constancia de ${course.name} - ${group.name}`);
    if (result === 'shared') showToast('Constancia compartida correctamente.', 'success');
    if (result === 'downloaded') showToast('Tu navegador no permite compartir archivos; descargamos el PDF.', 'success');
  };

  const timelineSteps = [
  { label: 'Solicitud creada', date: enrollment.enrollmentDate, done: true },
  {
    label: enrollment.status === 'cancelada' ? 'Matrícula confirmada' : 'Matrícula confirmada',
    date: enrollment.enrollmentDate,
    done: enrollment.status !== 'pendiente'
  },
  {
    label:
    enrollment.status === 'cancelada' ?
    'Matrícula cancelada' :
    enrollment.status === 'completada' ?
    'Laboratorio completado' :
    enrollment.status === 'pendiente' ?
    'En validación académica' :
    'Matrícula activa',
    date: enrollment.cancelledDate ?? enrollment.enrollmentDate,
    done: true,
    current: true
  }];


  return (
    <AppShell title="Detalle de matrícula" showBack onBack={() => navigate(viewer.role === 'admin' ? '/admin' : '/matriculas')}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Código de matrícula</p>
            <StatusBadge status={enrollment.status} />
          </div>
          <p className="text-lg font-bold text-ink">{enrollment.code}</p>
        </div>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-base font-semibold text-ink">Información del estudiante</h2>
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 shadow-card">
            <Detail icon={UserRoundIcon} label="Nombre" value={user.fullName} />
            <Detail icon={MailIcon} label="Correo institucional" value={user.email} />
            <Detail icon={UserRoundIcon} label="Código de estudiante" value={user.studentCode} />
          </div>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-base font-semibold text-ink">Curso y grupo</h2>
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 shadow-card">
            <Detail icon={UserRoundIcon} label="Curso" value={`${course.name} (${course.code})`} />
            <Detail icon={UserRoundIcon} label="Grupo" value={`${group.name} · ${group.instructor}`} />
            <Detail icon={CalendarIcon} label="Horario" value={`${group.day}, ${group.startTime}–${group.endTime}`} />
            <Detail icon={MapPinIcon} label="Laboratorio" value={group.room} />
          </div>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-base font-semibold text-ink">Seguimiento</h2>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-card">
            {timelineSteps.map((step, i) =>
            <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    step.done ? 'bg-burgundy text-white' : 'bg-border text-muted'
                  )}>
                  
                    {step.done ? <CheckIcon className="h-3.5 w-3.5" /> : <CircleIcon className="h-3 w-3" />}
                  </span>
                  {i < timelineSteps.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className={cn('text-sm font-semibold', step.done ? 'text-ink' : 'text-muted')}>{step.label}</p>
                  <p className="text-xs text-muted">{formatDate(step.date)}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-2.5">
          <Button size="lg" leftIcon={<DownloadIcon className="h-4.5 w-4.5" />} onClick={() => void handleDownload()}>
            Descargar constancia
          </Button>
          <Button size="lg" variant="secondary" leftIcon={<Share2Icon className="h-4.5 w-4.5" />} onClick={() => void handleShare()}>
            Compartir constancia
          </Button>
          {canCancel &&
          <Button size="lg" variant="destructive" onClick={() => setCancelOpen(true)}>
              Cancelar matrícula
            </Button>
          }
        </div>
      </div>

      <CancelEnrollmentDialog open={cancelOpen} onClose={() => setCancelOpen(false)} enrollment={enrollment} course={course} group={group} />
    </AppShell>);

}

function Detail({ icon: Icon, label, value }: {icon: React.ComponentType<{className?: string;}>;label: string;value: string;}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" aria-hidden="true" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>);

}
