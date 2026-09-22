import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, BellIcon, ChevronDownIcon, CloudOffIcon, LogOutIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import { Logo } from '../Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../utils/cn';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function AppHeader({ title, showBack = false, onBack }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount, pendingSyncCount } = useEnrollment();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleBack = () => onBack ? onBack() : window.history.state?.idx > 0 ? navigate(-1) : navigate('/cursos');
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {showBack ?
        <>
            <button
            type="button"
            onClick={handleBack}
            aria-label="Volver"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink transition-colors duration-150 hover:bg-neutral">
            
              <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <h1 className="truncate text-[15px] font-semibold text-ink md:text-lg">{title}</h1>
          </> :
        title ?
        <h1 className="truncate text-[17px] font-bold text-ink md:text-lg">{title}</h1> :

        <Logo size="sm" />
        }
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <ThemeToggle />
        {pendingSyncCount > 0 && <button type="button" onClick={() => navigate('/matriculas')} aria-label={`${pendingSyncCount} matrícula${pendingSyncCount === 1 ? '' : 's'} pendiente${pendingSyncCount === 1 ? '' : 's'} de sincronización`} className="relative flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors duration-150 hover:bg-primary-light"><CloudOffIcon className="h-5 w-5" aria-hidden="true" /><span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{pendingSyncCount}</span></button>}
        <button
          type="button"
          onClick={() => navigate('/notificaciones')}
          aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors duration-150 hover:bg-neutral">
          
          <BellIcon className="h-5.5 w-5.5" aria-hidden="true" />
          {unreadCount > 0 &&
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-white" aria-hidden="true" />
          }
        </button>

        <div className="relative hidden md:block" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 transition-colors duration-150 hover:bg-neutral">
            
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-xs font-bold text-white">
              {user?.avatarInitials}
            </div>
            <ChevronDownIcon className="h-4 w-4 text-muted" aria-hidden="true" />
          </button>
          {menuOpen &&
          <div
            role="menu"
            className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-floating animate-scale-in">
            
              <div className="border-b border-border px-3.5 py-2.5">
                <p className="truncate text-sm font-semibold text-ink">{user?.fullName}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <button
              role="menuitem"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate('/perfil');
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-ink hover:bg-neutral">
              
                <UserIcon className="h-4 w-4" aria-hidden="true" />
                Mi perfil
              </button>
              <button
              role="menuitem"
              type="button"
              onClick={handleLogout}
              className={cn('flex w-full items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger/5')}>
              
                <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            </div>
          }
        </div>
      </div>
    </header>);

}
