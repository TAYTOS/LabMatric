import { useNavigate } from 'react-router-dom';
import { FlaskConicalIcon, MicroscopeIcon, TestTubeIcon } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { InstallApp } from '../components/InstallApp';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <TestTubeIcon className="pointer-events-none absolute -left-6 top-16 h-28 w-28 rotate-[-12deg] text-burgundy-light" aria-hidden="true" />
      <FlaskConicalIcon className="pointer-events-none absolute -right-8 top-40 h-36 w-36 rotate-[10deg] text-burgundy-light" aria-hidden="true" />
      <MicroscopeIcon className="pointer-events-none absolute -left-10 bottom-24 h-32 w-32 rotate-[8deg] text-burgundy-light" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
        <Logo size="lg" />
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold text-ink">Escuela Profesional de Ingeniería de Sistemas</h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Gestiona tu matrícula en los laboratorios de Ingeniería de Sistemas
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3 px-8 pb-10">
        <Button size="lg" fullWidth onClick={() => navigate('/login')}>
          Iniciar sesión
        </Button>
        <Button size="lg" variant="secondary" fullWidth onClick={() => navigate('/register')}>
          Crear cuenta
        </Button>
        <InstallApp />
        <p className="pt-2 text-center text-xs text-muted">
          Universidad Nacional de San Agustín de Arequipa
        </p>
      </div>
    </div>);

}
