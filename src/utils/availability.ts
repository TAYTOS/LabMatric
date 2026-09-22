import { AvailabilityStatus, LabGroup } from '../types';

export function getAvailableSeats(group: Pick<LabGroup, 'capacity' | 'enrolled'>): number {
  return Math.max(0, group.capacity - group.enrolled);
}

export function getAvailabilityStatus(
group: Pick<LabGroup, 'capacity' | 'enrolled'>)
: AvailabilityStatus {
  const remaining = getAvailableSeats(group);
  if (remaining <= 0) return 'lleno';
  if (remaining / group.capacity <= 0.25) return 'pocas';
  return 'disponible';
}

interface AvailabilityMeta {
  label: string;
  textClass: string;
  bgClass: string;
  dotClass: string;
  barClass: string;
}

export function getAvailabilityMeta(status: AvailabilityStatus): AvailabilityMeta {
  switch (status) {
    case 'disponible':
      return {
        label: 'Disponible',
        textClass: 'text-success',
        bgClass: 'bg-success/10',
        dotClass: 'bg-success',
        barClass: 'bg-success'
      };
    case 'pocas':
      return {
        label: 'Pocas vacantes',
        textClass: 'text-warning',
        bgClass: 'bg-warning/10',
        dotClass: 'bg-warning',
        barClass: 'bg-warning'
      };
    case 'lleno':
      return {
        label: 'Sin cupos',
        textClass: 'text-danger',
        bgClass: 'bg-danger/10',
        dotClass: 'bg-danger',
        barClass: 'bg-danger'
      };
  }
}