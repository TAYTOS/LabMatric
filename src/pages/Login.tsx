import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/BottomSheet';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';
import { InstallApp } from '../components/InstallApp';

const DEMO_ACCOUNTS = mockUsers.map(({ role, email, password }) => ({
  label: role === 'admin' ? 'Cuenta de administrador' : 'Cuenta de estudiante', email, password
}));


export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isSubmitting } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string;password?: string;}>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const validate = () => {
    const next: {email?: string;password?: string;} = {};
    if (!email.trim()) next.email = 'Ingresa tu correo institucional.';
    if (!password) next.password = 'Ingresa tu contraseña.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    const result = await login(email, password);
    if (!result.success) {
      setFormError(result.error ?? 'No se pudo iniciar sesión.');
      return;
    }
    const redirectTo = (location.state as {from?: string;} | null)?.from;
    navigate(redirectTo ?? '/', { replace: true });
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError(null);
    setErrors({});
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-8 sm:items-center sm:justify-center">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size="md" />
          <div>
            <h1 className="text-xl font-bold text-ink">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-muted">Ingresa con tu correo institucional UNSA</p>
          </div>
        </div>

        {formError &&
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger/5 p-3.5 text-sm text-danger">
            <AlertCircleIcon className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {formError}
          </div>
        }

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label="Correo institucional"
            type="email"
            required
            placeholder="estudiante@unsa.edu.pe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<MailIcon className="h-4.5 w-4.5" />}
            autoComplete="email" />
          
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftIcon={<LockIcon className="h-4.5 w-4.5" />}
            autoComplete="current-password"
            rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
              
                {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
              </button>
            } />
          

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Sesión guardada en este navegador</span>
            <button
              type="button"
              onClick={() => {
                setForgotOpen(true);
              }}
              className="text-sm font-medium text-burgundy hover:underline">
              
              Olvidé mi contraseña
            </button>
          </div>

          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-burgundy hover:underline">
            Crear cuenta
          </Link>
        </p>

        <InstallApp />
        <div className="rounded-xl border border-border bg-neutral p-4">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">Credenciales de demostración</p>
          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((acc) =>
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc.email, acc.password)}
              className="flex flex-col items-start rounded-lg border border-border bg-white px-3 py-2 text-left transition-colors duration-150 hover:border-burgundy/40 hover:bg-burgundy-light">
              
                <span className="text-xs font-semibold text-ink">{acc.label}</span>
                <span className="text-xs text-muted">{acc.email} · {acc.password}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <BottomSheet open={forgotOpen} onClose={() => setForgotOpen(false)} title="Recuperar contraseña">
        <div className="flex flex-col gap-4 text-sm text-ink">
          <p>Esta demostración funciona en tu navegador y no envía correos de recuperación.</p>
          <p>Para acceder, utiliza una cuenta de demostración o registra otra cuenta con un correo institucional diferente.</p>
          <Button onClick={() => { fillDemo(DEMO_ACCOUNTS[0].email, DEMO_ACCOUNTS[0].password); setForgotOpen(false); }}>
            Usar cuenta de estudiante
          </Button>
        </div>
      </BottomSheet>
    </div>);

}
