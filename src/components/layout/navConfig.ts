import { CalendarDaysIcon, ClipboardListIcon, HomeIcon, LayoutDashboardIcon, LucideIcon, TestTubeIcon, UserIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const studentNavItems: NavItem[] = [
{ label: 'Inicio', path: '/home', icon: HomeIcon },
{ label: 'Cursos', path: '/cursos', icon: TestTubeIcon },
{ label: 'Matrículas', path: '/matriculas', icon: ClipboardListIcon },
{ label: 'Horario', path: '/calendario', icon: CalendarDaysIcon },
{ label: 'Perfil', path: '/perfil', icon: UserIcon }];


export const adminNavItems: NavItem[] = [
{ label: 'Panel', path: '/admin', icon: LayoutDashboardIcon },
{ label: 'Perfil', path: '/perfil', icon: UserIcon }];
