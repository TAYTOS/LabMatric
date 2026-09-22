import { useState } from 'react';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Button } from './ui/Button';
import { Course, Enrollment, LabGroup } from '../types';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { useToast } from '../contexts/ToastContext';

interface CancelEnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  enrollment: Enrollment;
  course: Course;
  group: LabGroup;
}

type View = 'confirm' | 'success' | 'error';

const REASON_OPTIONS = [
'Cruce de horario',
'Cambio de plan de estudios',
'Motivos personales',
'Otro'];


export function CancelEnrollmentDialog({ open, onClose, enrollment, course, group }: CancelEnrollmentDialogProps) {
  const { cancelEnrollment } = useEnrollment();
  const { showToast } = useToast();
  const [view, setView] = useState<View>('confirm');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
    window.setTimeout(() => {
      setView('confirm');
      setReason('');
    }, 200);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const result = await cancelEnrollment(enrollment.id, reason || undefined);
    setIsLoading(false);
    if (result.success) {
      setView('success');
      showToast('Tu matrícula fue cancelada correctamente.', 'success');
    } else {
      setView('error');
      showToast('No se pudo cancelar la matrícula.', 'error');
    }
  };

  return (
    <BottomSheet
      open={open}
      busy={isLoading}
      onClose={handleClose}
      title={view === 'success' ? 'Matrícula cancelada' : view === 'error' ? 'No se pudo cancelar' : '¿Cancelar matrícula?'}>
      
      {view === 'confirm' &&
      <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-ink">
            Se liberará tu vacante en el <span className="font-semibold">{group.name}</span> de{' '}
            <span className="font-semibold">{course.name}</span>. Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col gap-2">
            <label htmlFor="cancel-reason" className="text-sm font-medium text-ink">
              Motivo de cancelación <span className="font-normal text-muted">(opcional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REASON_OPTIONS.map((option) =>
            <button
              key={option}
              type="button"
              aria-pressed={reason === option}
              onClick={() => setReason((r) => r === option ? '' : option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
              reason === option ? 'border-burgundy bg-burgundy text-white' : 'border-border bg-white text-ink hover:bg-neutral'}`
              }>
              
                  {option}
                </button>
            )}
            </div>
            <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Cuéntanos brevemente el motivo (opcional)"
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/30" />
          
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={handleClose} disabled={isLoading} fullWidth className="sm:w-auto">
              Conservar matrícula
            </Button>
            <Button variant="destructive" onClick={handleConfirm} isLoading={isLoading} fullWidth className="sm:w-auto">
              Sí, cancelar matrícula
            </Button>
          </div>
        </div>
      }

      {view === 'success' &&
      <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 animate-check-pop">
            <CheckCircle2Icon className="h-9 w-9 text-success" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink">Tu matrícula fue cancelada</p>
            <p className="mt-1 text-sm text-muted">Tu vacante en {group.name} quedó disponible para otros estudiantes.</p>
          </div>
          <Button fullWidth onClick={handleClose}>
            Cerrar
          </Button>
        </div>
      }

      {view === 'error' &&
      <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <XCircleIcon className="h-9 w-9 text-danger" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink">Ocurrió un error inesperado</p>
            <p className="mt-1 text-sm text-muted">No pudimos cancelar tu matrícula. Inténtalo nuevamente.</p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button fullWidth onClick={() => setView('confirm')}>
              Reintentar
            </Button>
            <Button variant="secondary" fullWidth onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </div>
      }
    </BottomSheet>);

}