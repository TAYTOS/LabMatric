import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  ChevronRightIcon,
  FlaskConicalIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  IdCardIcon,
  InfoIcon,
  LogOutIcon,
  MailIcon,
  UserCogIcon } from
'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { InstallApp } from '../components/InstallApp';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { requestReminderPermission, sendDeadlineReminder } from '../services/notificationService';

type SheetKey = 'edit' | 'help' | 'about' | null;

export function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const { courses, groups } = useEnrollment();
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [names, setNames] = useState(user?.names ?? '');
  const [surnames, setSurnames] = useState(user?.surnames ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const [profileError, setProfileError] = useState<string | null>(null);

  if (!user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateProfile({ names, surnames, email });
    if (!result.success) { setProfileError(result.error ?? "Revisa tus datos."); return; }
    setProfileError(null);
    setSheet(null);
    showToast('Tu información se actualizó correctamente.', 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const handleReminders = async () => {
    const permission = await requestReminderPermission();
    if (permission === 'unsupported') { showToast('Este navegador no admite notificaciones locales.', 'error'); return; }
    if (permission === 'denied') { showToast('No se concedió permiso para mostrar recordatorios.', 'error'); return; }
    const shown = await sendDeadlineReminder(courses, groups);
    showToast(shown ? 'Recordatorio local de prueba enviado.' : 'No se pudo mostrar el recordatorio.', shown ? 'success' : 'error');
  };

  const options: {key: SheetKey | 'logout';icon: React.ComponentType<{className?: string;}>;label: string;danger?: boolean;}[] = [
  { key: 'edit', icon: UserCogIcon, label: 'Editar información' },
  { key: 'help', icon: HelpCircleIcon, label: 'Ayuda' },
  { key: 'about', icon: InfoIcon, label: 'Acerca de la aplicación' },
  { key: 'logout', icon: LogOutIcon, label: 'Cerrar sesión', danger: true }];


  return (
    <AppShell title="Perfil">
      <div className="flex flex-col gap-6">
        <InstallApp />
        <div className="flex flex-col gap-2 rounded-2xl border border-primary/25 bg-primary-light p-4"><div className="flex items-center gap-2"><BellIcon className="h-5 w-5 text-primary" /><p className="text-sm font-semibold text-ink">Recordatorios locales</p></div><p className="text-sm text-muted">Envía una notificación de prueba mientras LabMatric está activa en este dispositivo.</p><Button variant="secondary" size="sm" className="self-start" onClick={() => void handleReminders()}>Probar recordatorio</Button></div>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-6 text-center shadow-card">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-burgundy text-2xl font-bold text-white">
            {user.avatarInitials}
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink">{user.fullName}</h1>
            <p className="text-sm text-muted">Código {user.studentCode}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow icon={MailIcon} label="Correo institucional" value={user.email} />
          <InfoRow icon={IdCardIcon} label="Código de estudiante" value={user.studentCode} />
          <InfoRow icon={GraduationCapIcon} label="Programa" value={user.program} />
          <InfoRow icon={FlaskConicalIcon} label="Semestre" value={user.semester} />
          <InfoRow icon={BellIcon} label="Periodo académico" value={user.period} />
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          {options.map((option, i) =>
          <button
            key={option.label}
            type="button"
            onClick={() => option.key === 'logout' ? setLogoutOpen(true) : setSheet(option.key as SheetKey)}
            className={`flex items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-neutral ${
            i !== options.length - 1 ? 'border-b border-border' : ''}`
            }>
            
              <option.icon className={`h-4.5 w-4.5 shrink-0 ${option.danger ? 'text-danger' : 'text-burgundy'}`} />
              <span className={`flex-1 text-sm font-medium ${option.danger ? 'text-danger' : 'text-ink'}`}>{option.label}</span>
              {option.key !== 'logout' && <ChevronRightIcon className="h-4 w-4 text-muted" />}
            </button>
          )}
        </div>
      </div>

      <BottomSheet open={sheet === 'edit'} onClose={() => setSheet(null)} title="Editar información">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          {profileError && <p role="alert" className="text-sm text-danger">{profileError}</p>}
          <Input label="Nombres" required value={names} onChange={(e) => setNames(e.target.value)} />
          <Input label="Apellidos" required value={surnames} onChange={(e) => setSurnames(e.target.value)} />
          <Input label="Correo institucional" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" fullWidth>
            Guardar cambios
          </Button>
        </form>
      </BottomSheet>

      <BottomSheet open={sheet === 'help'} onClose={() => setSheet(null)} title="Ayuda">
        <div className="flex flex-col gap-4 text-sm text-ink">
          <div>
            <p className="font-semibold">¿Cómo me matriculo en un laboratorio?</p>
            <p className="text-muted">Ingresa a Cursos, elige un curso, selecciona un grupo con vacantes y confirma tu matrícula.</p>
          </div>
          <div>
            <p className="font-semibold">¿Puedo cancelar una matrícula?</p>
            <p className="text-muted">Sí, desde Mis matrículas o el detalle puedes cancelar una matrícula activa o pendiente. Se solicitará confirmación antes de liberar tu vacante.</p>
          </div>
          <div>
            <p className="font-semibold">¿A quién contacto por soporte?</p>
            <p className="text-muted">Esta es una demostración académica. Comunica las incidencias al equipo responsable del trabajo de laboratorio.</p>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'about'} onClose={() => setSheet(null)} title="Acerca de la aplicación">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-burgundy">
            <FlaskConicalIcon className="h-7 w-7 text-white" />
          </div>
           <p className="text-sm font-semibold text-ink">LabMatric v1.0.0</p>
          <p className="text-sm text-muted">
            Plataforma de matrícula en laboratorios de la Escuela Profesional de Ingeniería de Sistemas, Universidad
            Nacional de San Agustín de Arequipa.
          </p>
        </div>
      </BottomSheet>

      <ConfirmationDialog
        open={logoutOpen}
        title="Cerrar sesión"
        message="¿Seguro que deseas cerrar tu sesión? Deberás iniciar sesión nuevamente para acceder a tu matrícula."
        icon={LogOutIcon}
        tone="danger"
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)} />
      
    </AppShell>);

}

function InfoRow({ icon: Icon, label, value }: {icon: React.ComponentType<{className?: string;}>;label: string;value: string;}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3.5 shadow-card">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-burgundy-light">
        <Icon className="h-4.5 w-4.5 text-burgundy" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>);

}
