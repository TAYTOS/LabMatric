import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2Icon, InfoIcon, XCircleIcon, XIcon } from 'lucide-react';
import { cn } from '../utils/cn';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-6"
        aria-live="polite"
        aria-atomic="true">
        
        {toasts.map((toast) =>
        <div
          key={toast.id}
          role="status"
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border bg-white p-3.5 shadow-floating animate-slide-up',
            toast.type === 'success' && 'border-success/20',
            toast.type === 'error' && 'border-danger/20',
            toast.type === 'info' && 'border-border'
          )}>
          
            {toast.type === 'success' &&
          <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          }
            {toast.type === 'error' &&
          <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
          }
            {toast.type === 'info' &&
          <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" aria-hidden="true" />
          }
            <p className="flex-1 text-sm text-ink">{toast.message}</p>
            <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="shrink-0 rounded-md p-0.5 text-muted transition-colors hover:bg-neutral hover:text-ink"
            aria-label="Cerrar notificación">
            
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>);

}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
