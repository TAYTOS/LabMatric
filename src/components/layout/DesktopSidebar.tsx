import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronsLeftIcon, ChevronsRightIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminNavItems, studentNavItems } from './navConfig';
import { Logo } from '../Logo';
import { cn } from '../../utils/cn';

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DesktopSidebar({ collapsed, onToggle }: DesktopSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = user?.role === 'admin' ? adminNavItems : studentNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-white transition-[width] duration-200 ease-out lg:flex',
        collapsed ? 'w-20' : 'w-64'
      )}>
      
      <div className={cn('flex h-16 items-center border-b border-border', collapsed ? 'justify-center px-2' : 'justify-between px-5')}>
        <Logo size="sm" showWordmark={!collapsed} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navegación principal">
        {items.map((item) =>
        <NavLink
          key={item.path}
          to={item.path}
          title={item.label}
          className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out',
            collapsed && 'justify-center',
            isActive ? 'bg-burgundy-light text-burgundy' : 'text-muted hover:bg-neutral hover:text-ink'
          )
          }>
          
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        )}
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        {!collapsed && user &&
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-burgundy text-xs font-bold text-white">
              {user.avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
        }
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger/5',
            collapsed && 'justify-center'
          )}>
          
          <LogOutIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-neutral hover:text-ink',
            collapsed && 'justify-center'
          )}>
          
          {collapsed ? <ChevronsRightIcon className="h-5 w-5" aria-hidden="true" /> : <ChevronsLeftIcon className="h-5 w-5" aria-hidden="true" />}
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>);

}