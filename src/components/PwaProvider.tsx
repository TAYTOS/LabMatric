import { ReactNode, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { InstallPromptEvent, PwaContext } from '../contexts/PwaContext';
import { Button } from './ui/Button';

export function PwaProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
  const [online, setOnline] = useState(navigator.onLine);
  const [registrationError, setRegistrationError] = useState(false);
  const { offlineReady: [offlineReady], needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisterError: () => setRegistrationError(true),
  });
  useEffect(() => {
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    const onConnection = () => setOnline(navigator.onLine);
    const mode = window.matchMedia('(display-mode: standalone)');
    const onMode = () => setInstalled(mode.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('online', onConnection);
    window.addEventListener('offline', onConnection);
    mode.addEventListener('change', onMode);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('online', onConnection);
      window.removeEventListener('offline', onConnection);
      mode.removeEventListener('change', onMode);
    };
  }, []);
  return <PwaContext.Provider value={{ installPrompt, clearInstallPrompt: () => setInstallPrompt(null), installed, online, offlineReady, registrationError }}>
    {!online && <p role="status" className="bg-primary-light px-4 py-2 text-center text-sm text-primary">Sin conexión. Las matrículas se encolarán hasta recuperar la conexión.</p>}
    {children}
    {needRefresh && <div role="status" className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-xl border border-border bg-white p-4 shadow-floating lg:bottom-6">
      <p className="mb-3 text-sm text-ink">Hay una nueva versión. Termina tus cambios antes de actualizar.</p>
      <div className="flex gap-2">
        <Button onClick={() => { void updateServiceWorker(true); }}>Actualizar</Button>
        <Button variant="secondary" onClick={() => setNeedRefresh(false)}>Más tarde</Button>
      </div>
    </div>}
  </PwaContext.Provider>;
}
