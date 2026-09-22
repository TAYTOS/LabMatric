import { useEffect, useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { usePwa } from '../contexts/PwaContext';
import { useToast } from '../contexts/ToastContext';
import { BottomSheet } from './BottomSheet';
import { Button } from './ui/Button';

// Se reinicia solo al recargar la página completa; evita repetir el aviso
// al navegar entre Bienvenida, Login y Perfil dentro de la misma sesión.
let installedToastShown = false;

export function InstallApp() {
  const { installPrompt, clearInstallPrompt, installed, offlineReady, registrationError } = usePwa();
  const { showToast } = useToast();
  const [helpOpen, setHelpOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  useEffect(() => {
    if (installed && !installedToastShown) {
      installedToastShown = true;
       showToast('LabMatric está instalada.', 'success');
    }
  }, [installed, showToast]);
  const install = async () => {
    if (!installPrompt) { setHelpOpen(true); return; }
    setInstalling(true);
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch {
      setHelpOpen(true);
    } finally {
      clearInstallPrompt();
      setInstalling(false);
    }
  };
  return <div className="flex flex-col gap-2">
    {!installed && <Button variant="secondary" fullWidth isLoading={installing} leftIcon={<DownloadIcon className="h-5 w-5" />} onClick={() => { void install(); }}>Instalar aplicación</Button>}
    {offlineReady && !import.meta.env.DEV && <p className="text-center text-xs text-muted">Aplicación lista para usar sin conexión.</p>}
    {registrationError && <p role="status" className="text-sm text-warning">No se pudo preparar el modo sin conexión. Prueba recargar cuando tengas conexión.</p>}
     <BottomSheet open={helpOpen} onClose={() => setHelpOpen(false)} title="Instalar LabMatric">
      <div className="flex flex-col gap-4 text-sm text-ink">
        {!window.isSecureContext && <p className="rounded-xl bg-warning/10 p-3 text-warning">Para instalar, abre la aplicación desde una dirección HTTPS. Esta dirección permite usarla en el navegador.</p>}
        <p><strong>Android:</strong> abre el menú de Chrome y elige «Instalar aplicación» o «Añadir a pantalla de inicio», si está disponible.</p>
        <p><strong>iPhone o iPad:</strong> abre la aplicación en Safari, pulsa Compartir y «Añadir a pantalla de inicio».</p>
        <p><strong>Computadora:</strong> en Chrome o Edge, busca la opción de instalar en la barra de direcciones o en el menú del navegador.</p>
         <p className="text-muted">La instalación la confirma el navegador. Después podrás abrir LabMatric desde su propio icono.</p>
        <Button fullWidth onClick={() => setHelpOpen(false)}>Entendido</Button>
      </div>
    </BottomSheet>
  </div>;
}
