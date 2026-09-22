import React from "react";
import { AlertTriangleIcon, LucideIcon } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./ui/Button";
import { cn } from "../utils/cn";
interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  icon?: LucideIcon;
  tone?: 'burgundy' | 'danger';
  confirmLabel: string;
  cancelLabel: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}
export function ConfirmationDialog({
  open,
  title,
  message,
  icon: Icon = AlertTriangleIcon,
  tone = 'burgundy',
  confirmLabel,
  cancelLabel,
  isLoading = false,
  onConfirm,
  onCancel,
  children
}: ConfirmationDialogProps) {
  return <BottomSheet busy={isLoading} open={open} onClose={onCancel} title={title}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-burgundy-light text-burgundy')}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="pt-2 text-sm leading-relaxed text-ink">{message}</p>
        </div>
        {children}
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading} fullWidth className="sm:w-auto">
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'destructive' : 'primary'} onClick={onConfirm} isLoading={isLoading} fullWidth className="sm:w-auto">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BottomSheet>;
}