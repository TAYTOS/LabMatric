import { BellOffIcon, CheckCheckIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/EmptyState';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { notificationIconFor } from '../utils/notificationMeta';
import { formatDate } from '../utils/schedule';
import { cn } from '../utils/cn';

export function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useEnrollment();
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <AppShell title="Notificaciones" showBack>
      <div className="flex flex-col gap-4">
        {hasUnread &&
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="flex items-center gap-1.5 self-end text-sm font-semibold text-burgundy hover:underline">
          
            <CheckCheckIcon className="h-4 w-4" />
            Marcar todas como leídas
          </button>
        }

        {notifications.length === 0 ?
        <EmptyState icon={BellOffIcon} title="Sin notificaciones" description="Aquí verás tus avisos importantes." /> :

        <div className="flex flex-col gap-2.5">
            {notifications.map((notification) => {
            const Icon = notificationIconFor(notification.type);
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => markNotificationRead(notification.id)}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border p-4 text-left shadow-card transition-colors duration-150 ease-out',
                  notification.read ? 'border-border bg-white' : 'border-burgundy/20 bg-burgundy-light/40'
                )}>
                
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className="h-5 w-5 text-burgundy" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{notification.title}</p>
                      {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-burgundy" aria-label="No leída" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{notification.message}</p>
                    <p className="mt-1.5 text-xs text-muted">{formatDate(notification.date)}</p>
                  </div>
                </button>);

          })}
          </div>
        }
      </div>
    </AppShell>);

}