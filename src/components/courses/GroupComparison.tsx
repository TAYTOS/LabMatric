import { CalendarIcon, MapPinIcon, UserRoundIcon, UsersIcon } from 'lucide-react';
import { LabGroup } from '../../types';
import { getAvailableSeats } from '../../utils/availability';

export function GroupComparison({ groups }: { groups: LabGroup[] }) {
  const rows = [
    { label: 'Docente', icon: UserRoundIcon, value: (group: LabGroup) => group.instructor },
    { label: 'Horario', icon: CalendarIcon, value: (group: LabGroup) => `${group.day}, ${group.startTime}-${group.endTime}` },
    { label: 'Laboratorio', icon: MapPinIcon, value: (group: LabGroup) => group.room },
    { label: 'Vacantes', icon: UsersIcon, value: (group: LabGroup) => `${getAvailableSeats(group)} de ${group.capacity} disponibles` },
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="p-4 text-sm font-semibold text-muted">Comparar</th>
            {groups.map((group) => <th key={group.id} className="min-w-52 p-4 text-sm font-bold text-ink">{group.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => <tr key={row.label} className="border-b border-border last:border-b-0">
            <th className="whitespace-nowrap p-4 text-sm font-semibold text-ink"><span className="flex items-center gap-2"><row.icon className="h-4 w-4 text-primary" />{row.label}</span></th>
            {groups.map((group) => <td key={group.id} className="p-4 text-sm text-muted">{row.value(group)}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}
