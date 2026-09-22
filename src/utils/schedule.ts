import { LabGroup } from '../types';

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function hasScheduleConflict(
a: Pick<LabGroup, 'day' | 'startTime' | 'endTime'>,
b: Pick<LabGroup, 'day' | 'startTime' | 'endTime'>)
: boolean {
  if (a.day !== b.day) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDateShort(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short'
  });
}
