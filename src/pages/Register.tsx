import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon, XIcon } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { isInstitutionalEmail, isValidStudentCode, getPasswordChecks } from '../utils/validation';
import { cn } from '../utils/cn';

interface FormState {
  names: string;
  surnames: string;
  studentCode: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const initialForm: FormState = {
  names: '',
  surnames: '',
  studentCode: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
};

export function Register() {
  const navigate = useNavigate();
  const { register, isSubmitting } = useAuth();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const passwordChecks = getPasswordChecks(form.password);

  const update = <K extends keyof FormState,>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.names.trim()) next.names = 'Ingresa tus nombres.';
    if (!form.surnames.trim()) next.surnames = 'Ingresa tus apellidos.';
    if (!isValidStudentCode(form.studentCode)) next.studentCode = 'El código debe tener 8 dígitos.';
    if (!isInstitutionalEmail(form.email)) next.email = 'Usa tu correo institucional (@unsa.edu.pe).';
    if (!passwordChecks.minLength || !passwordChecks.hasLetter || !passwordChecks.hasNumber) {
      next.password = 'La contraseña no cumple los requisitos mínimos.';
    }
    if (form.confirmPassword !== form.password || !form.confirmPassword) {
      next.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (!form.acceptTerms) next.acceptTerms = 'Debes aceptar los términos y condiciones.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    const result = await register({
      names: form.names.trim(),
      surnames: form.surnames.trim(),
      studentCode: form.studentCode.trim(),
      email: form.email.trim(),
      password: form.password
    });
    if (!result.success) {
      setFormError(result.error ?? 'No se pudo crear la cuenta.');
      return;
    }
    navigate('/home', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-8 sm:items-center">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size="md" />
          <div>
            <h1 className="text-xl font-bold text-ink">Crear cuenta</h1>
            <p className="mt-1 text-sm text-muted">Regístrate con tu correo institucional UNSA</p>
          </div>
        </div>

        {formError &&
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger/5 p-3.5 text-sm text-danger">
            <AlertCircleIcon className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {formError}
          </div>
        }

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombres"
              required
              value={form.names}
              onChange={(e) => update('names', e.target.value)}
              error={errors.names}
              leftIcon={<UserIcon className="h-4.5 w-4.5" />}
              autoComplete="given-name" />
            
            <Input
              label="Apellidos"
              required
              value={form.surnames}
              onChange={(e) => update('surnames', e.target.value)}
              error={errors.surnames}
              autoComplete="family-name" />
            
          </div>

          <Input
            label="Código de estudiante"
            required
            inputMode="numeric"
            placeholder="20201234"
            value={form.studentCode}
            onChange={(e) => update('studentCode', e.target.value.replace(/\D/g, '').slice(0, 8))}
            error={errors.studentCode}
            hint="8 dígitos, tal como figura en tu carné universitario." />
          

          <Input
            label="Correo institucional"
            type="email"
            required
            placeholder="nombre.apellido@unsa.edu.pe"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
            leftIcon={<MailIcon className="h-4.5 w-4.5" />}
            autoComplete="email" />
          

          <div className="flex flex-col gap-2">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              error={errors.password}
              leftIcon={<LockIcon className="h-4.5 w-4.5" />}
              autoComplete="new-password"
              rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
                
                  {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                </button>
              } />
            
            <ul className="flex flex-col gap-1 pl-1 text-xs">
              <PasswordRule met={passwordChecks.minLength} label="Mínimo 8 caracteres" />
              <PasswordRule met={passwordChecks.hasLetter} label="Al menos una letra" />
              <PasswordRule met={passwordChecks.hasNumber} label="Al menos un número" />
            </ul>
          </div>

          <Input
            label="Confirmar contraseña"
            type={showConfirm ? 'text' : 'password'}
            required
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            leftIcon={<LockIcon className="h-4.5 w-4.5" />}
            autoComplete="new-password"
            rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
              
                {showConfirm ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
              </button>
            } />
          

          <Checkbox
            label={
            <>
                Acepto las condiciones de esta demostración académica.
              </>
            }
            checked={form.acceptTerms}
            onChange={(e) => update('acceptTerms', e.target.checked)}
            error={errors.acceptTerms} />
          <details className="text-sm text-muted">
            <summary className="cursor-pointer text-burgundy">Condiciones y privacidad de la demostración</summary>
            <p className="mt-2">Los datos y credenciales se guardan únicamente en este navegador. Usa datos ficticios y una contraseña de prueba. Las matrículas son simuladas, no tienen validez académica y se eliminan al borrar los datos del sitio. No se envían correos ni notificaciones push.</p>
          </details>
          

          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            Crear cuenta
          </Button>
        </form>

        <p className="pb-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-burgundy hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>);

}

function PasswordRule({ met, label }: {met: boolean;label: string;}) {
  return (
    <li className={cn('flex items-center gap-1.5', met ? 'text-success' : 'text-muted')}>
      {met ? <CheckIcon className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
      {label}
    </li>);

}
