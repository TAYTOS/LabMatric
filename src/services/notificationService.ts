import { Course, LabGroup } from '../types';
import { formatDate } from '../utils/schedule';

export type ReminderPermission = 'granted' | 'denied' | 'unsupported';

export async function requestReminderPermission(): Promise<ReminderPermission> {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  return (await Notification.requestPermission()) === 'granted' ? 'granted' : 'denied';
}

export async function showLocalReminder(title: string, body: string): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: 'labmatric-reminder' });
    } else {
      new Notification(title, { body, icon: '/icons/icon-192.png', tag: 'labmatric-reminder' });
    }
    return true;
  } catch {
    return false;
  }
}

export async function sendDeadlineReminder(courses: Course[], groups: LabGroup[]): Promise<boolean> {
  const nextGroup = [...groups].sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
  if (!nextGroup) return false;
  const course = courses.find((item) => item.id === nextGroup.courseId);
  return showLocalReminder('Recordatorio de matrícula', `El plazo para ${course?.name ?? 'un grupo de laboratorio'} - ${nextGroup.name} vence el ${formatDate(nextGroup.deadline)}.`);
}
