import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminNavItems, studentNavItems } from './navConfig';
import { cn } from '../../utils/cn';

export function MobileBottomNav() {
  const { user } = useAuth();
  const items = user?.role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      
      <div className="flex h-16 items-stretch justify-around">
        {items.map((item) =>
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
          cn(
            'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150',
            isActive ? 'text-burgundy' : 'text-muted hover:text-ink'
          )
          }>
          
            {({ isActive }) =>
          <>
                <item.icon className="h-5.5 w-5.5" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                <span>{item.label}</span>
              </>
          }
          </NavLink>
        )}
      </div>
    </nav>);

}