import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface BottomSheetProps {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function BottomSheet({ open, busy = false, onClose, title, children, maxWidthClass = 'sm:max-w-md' }: BottomSheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const isBusy = useRef(busy);
  close.current = onClose;
  isBusy.current = busy;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = document.getElementById('root');
    if (root) root.inert = true;
    panel.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy.current) close.current();
      if (e.key === 'Tab') {
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]') ?? []).filter((el) => el.getClientRects().length > 0);
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) { e.preventDefault(); panel.current?.focus(); }
        else if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = overflow;
      if (root) root.inert = false;
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title} aria-busy={busy}>
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[1px] animate-fade-in"
        onClick={() => !busy && onClose()}
        aria-hidden="true" />
      
      <div
        ref={panel}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-floating animate-slide-up',
          'sm:rounded-2xl sm:animate-scale-in',
          maxWidthClass
        )}>
        
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-neutral hover:text-ink">
            
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>, document.body);

}
