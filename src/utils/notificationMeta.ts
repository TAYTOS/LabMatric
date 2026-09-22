import {
  AlertTriangleIcon,
   CalendarClockIcon,
   BellRingIcon,
  CheckCircle2Icon,
  LucideIcon,
  RefreshCwIcon,
  XCircleIcon } from
'lucide-react';
import { NotificationType } from '../types';

export function notificationIconFor(type: NotificationType): LucideIcon {
  switch (type) {
    case 'enrollment_success':
      return CheckCircle2Icon;
    case 'upcoming_session':
      return CalendarClockIcon;
    case 'deadline':
      return AlertTriangleIcon;
    case 'group_change':
      return RefreshCwIcon;
    case 'cancellation':
      return XCircleIcon;
    case 'waitlist_available':
      return BellRingIcon;
    case 'offline_sync':
      return RefreshCwIcon;
  }
}
