import React, { useEffect, useState } from 'react';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DayOfWeek, LabGroup } from '../../types';
import { GroupInput } from '../../contexts/EnrollmentContext';

const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface GroupFormSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: LabGroup;
  onSubmit: (input: GroupInput) => void;
}

const emptyForm: GroupInput = {
  name: 'Grupo C',
  instructor: '',
  day: 'Lunes',
  startTime: '08:00',
  endTime: '09:40',
  room: '',
  capacity: 20,
  deadline: new Date().toISOString().slice(0, 10),
  topics: []
};

export function GroupFormSheet({ open, onClose, initial, onSubmit }: GroupFormSheetProps) {
  const [form, setForm] = useState<GroupInput>(emptyForm);
  const [topicsText, setTopicsText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      const base = initial ?? emptyForm;
      setForm(base);
      setTopicsText((initial?.topics ?? []).join('\n'));
    }
  }, [open, initial]);

  const update = <K extends keyof GroupInput,>(key: K, value: GroupInput[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.startTime >= form.endTime) { setError('La hora de fin debe ser posterior al inicio.'); return; }
    if (!Number.isInteger(form.capacity) || form.capacity < Math.max(1, initial?.enrolled ?? 0)) { setError('La capacidad debe cubrir a todos los estudiantes matriculados.'); return; }
    if (![form.name, form.instructor, form.room].every((s) => s.trim())) { setError('Completa el nombre, docente y laboratorio.'); return; }
    onSubmit({
      ...form,
      capacity: Number(form.capacity),
      topics: topicsText.
      split('\n').
      map((t) => t.trim()).
      filter(Boolean)
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={initial ? 'Editar grupo' : 'Nuevo grupo'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre del grupo" required value={form.name} onChange={(e) => update('name', e.target.value)} />
          <Input label="Jefe de práctica" required value={form.instructor} onChange={(e) => update('instructor', e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="group-day">
              Día
            </label>
            <select
              id="group-day"
              value={form.day}
              onChange={(e) => update('day', e.target.value as DayOfWeek)}
              className="h-12 w-full rounded-xl border border-border bg-white px-2 text-sm text-ink focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/30">
              
              {DAYS.map((d) =>
              <option key={d} value={d}>
                  {d}
                </option>
              )}
            </select>
          </div>
          <Input label="Inicio" type="time" required value={form.startTime} onChange={(e) => update('startTime', e.target.value)} />
          <Input label="Fin" type="time" required value={form.endTime} onChange={(e) => update('endTime', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Laboratorio" required value={form.room} onChange={(e) => update('room', e.target.value)} />
          <Input
            label="Capacidad"
            type="number"
            min={Math.max(1, initial?.enrolled ?? 0)}
            required
            value={form.capacity}
            onChange={(e) => update('capacity', Number(e.target.value))}
            hint="Configura el número máximo de vacantes." />
          
        </div>
        <Input label="Plazo de matrícula" type="date" required value={form.deadline} onChange={(e) => update('deadline', e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink" htmlFor="group-topics">
            Temario (una sesión por línea)
          </label>
          <textarea
            id="group-topics"
            rows={4}
            value={topicsText}
            onChange={(e) => setTopicsText(e.target.value)}
            placeholder={'Introducción al curso\nPráctica dirigida 1'}
            className="w-full resize-none rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/30" />
          
        </div>
        <Button type="submit" fullWidth>
          {initial ? 'Guardar cambios' : 'Crear grupo'}
        </Button>
      </form>
    </BottomSheet>);

}
