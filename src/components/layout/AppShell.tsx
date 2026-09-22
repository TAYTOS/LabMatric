import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { cn } from '../../utils/cn';

interface AppShellProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  wide?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
}

export function AppShell({ title, showBack, onBack, wide = false, noPadding = false, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-neutral">
      <DesktopSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className={cn('flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 ease-out', collapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        <AppHeader title={title} showBack={showBack} onBack={onBack} />
        <main className={cn('min-w-0 flex-1', noPadding ? '' : 'px-4 pt-5 md:px-8 md:pt-8', 'pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-10')}>
          <div className={cn('mx-auto w-full', wide ? 'max-w-6xl' : 'max-w-3xl')}>{children}</div>
        </main>
      </div>
      <MobileBottomNav />
    </div>);

}
