import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, CalendarIcon, CheckCircle2Icon, MapPinIcon, UsersIcon, XCircleIcon } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Button } from './ui/Button';
import { Course, EnrollErrorCode, LabGroup } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { useToast } from '../contexts/ToastContext';
import { ACADEMIC_PERIOD } from '../data/mockData';
import { getAvailableSeats } from '../utils/availability';

interface EnrollmentSheetProps {
  open: boolean;
  onClose: () => void;
  course: Course;
  group: LabGroup;
}

type SheetView = 'confirm' | 'success' | 'queued' | 'error';

const errorCopy: Record<EnrollErrorCode, {title: string;message: string;}> = {
  already_enrolled: {
    title: 'Ya tienes una matrícula activa',
    message: 'Ya cuentas con una matrícula activa o pendiente en este curso. Cancélala antes de matricularte en otro grupo.'
  },
  full: {
    title: 'Sin vacantes disponibles',
    message: 'Este grupo ya no cuenta con vacantes disponibles. Elige otro grupo u horario.'
  },
  conflict: {
    title: 'Cruce de horario',
    message: 'Este horario se cruza con otra matrícula activa que ya tienes registrada.'
  },
  unknown: {
    title: 'Ocurrió un error',
    message: 'No pudimos procesar tu matrícula. Inténtalo nuevamente en unos segundos.'
  }
};

export function EnrollmentSheet({ open, onClose, course, group }: EnrollmentSheetProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enroll } = useEnrollment();
  const { showToast } = useToast();

  const [view, setView] = useState<SheetView>('confirm');
  const [errorCode, setErrorCode] = useState<EnrollErrorCode>('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const availableSeats = getAvailableSeats(group);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
    window.setTimeout(() => setView('confirm'), 200);
  };

  const handleConfirm = async () => {
    if (!user) return;
    setIsLoading(true);
    const result = await enroll(user.id, course.id, group.id);
    setIsLoading(false);
    if (result.success) {
      if (result.queued) {
        setView('queued');
        showToast('Guardamos tu solicitud para sincronizarla cuando vuelva la conexión.', 'success');
      } else {
        setView('success');
        showToast('Tu matrícula se registró correctamente.', 'success');
      }
    } else {
      setErrorCode(result.error ?? 'unknown');
      setView('error');
      showToast('No se pudo completar la matrícula.', 'error');
    }
  };

  return (
    <BottomSheet
      open={open}
      busy={isLoading}
      onClose={handleClose}
      title={view === 'success' ? 'Matrícula confirmada' : view === 'queued' ? 'Solicitud guardada' : view === 'error' ? 'No se pudo matricular' : 'Confirmar matrícula'}>
      
      {view === 'confirm' &&
      <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-neutral p-4">
            <p className="text-sm font-semibold text-ink">{course.name}</p>
            <p className="text-xs text-muted">{group.name} · {group.instructor}</p>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 shrink-0" /> {group.day}, {group.startTime}–{group.endTime}
              </span>
              <span className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 shrink-0" /> {group.room}
              </span>
              <span className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 shrink-0" /> {availableSeats} vacantes disponibles
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-burgundy/20 bg-burgundy-light p-3.5 text-sm text-burgundy">
            <AlertTriangleIcon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            Al confirmar, se reservará tu vacante en este grupo de laboratorio para el periodo {ACADEMIC_PERIOD}.
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={handleClose} disabled={isLoading} fullWidth className="sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} isLoading={isLoading} fullWidth className="sm:w-auto">
              Confirmar matrícula
            </Button>
          </div>
        </div>
      }

      {view === 'success' &&
      <div role="status" className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 animate-check-pop">
            <CheckCircle2Icon className="h-9 w-9 text-success" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink">Tu matrícula se registró correctamente</p>
            <p className="mt-1 text-sm text-muted">
              {course.name} · {group.name}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button
            fullWidth
            onClick={() => {
              handleClose();
              navigate('/matriculas');
            }}>
            
              Ver mis matrículas
            </Button>
            <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              handleClose();
              navigate('/cursos');
            }}>
            
              Volver a cursos
            </Button>
          </div>
        </div>
      }

      {view === 'queued' &&
      <div role="status" className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <CheckCircle2Icon className="h-9 w-9 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink">Tu solicitud quedó en cola</p>
            <p className="mt-1 text-sm text-muted">Se validará y aplicará automáticamente cuando el dispositivo recupere conexión.</p>
          </div>
          <div className="flex w-full flex-col gap-2"><Button fullWidth onClick={() => { handleClose(); navigate('/matriculas'); }}>Ver estado de sincronización</Button><Button variant="secondary" fullWidth onClick={handleClose}>Seguir explorando</Button></div>
        </div>
      }

      {view === 'error' &&
      <div role="alert" className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <XCircleIcon className="h-9 w-9 text-danger" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink">{errorCopy[errorCode].title}</p>
            <p className="mt-1 text-sm text-muted">{errorCopy[errorCode].message}</p>
          </div>
          <div className="flex w-full flex-col gap-2">
            {errorCode !== 'full' &&
          <Button fullWidth onClick={() => setView('confirm')}>
                Reintentar
              </Button>
          }
            <Button variant="secondary" fullWidth onClick={handleClose}>
              Entendido
            </Button>
          </div>
        </div>
      }
    </BottomSheet>);

}
