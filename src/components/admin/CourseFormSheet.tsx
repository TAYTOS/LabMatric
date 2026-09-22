import React, { useEffect, useState } from 'react';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Course } from '../../types';
import { CourseInput } from '../../contexts/EnrollmentContext';

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

interface CourseFormSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: Course;
  onSubmit: (input: CourseInput) => void;
}

const emptyForm: CourseInput = { code: '', name: '', description: '', semester: 'IX', credits: 3, instructor: '' };

export function CourseFormSheet({ open, onClose, initial, onSubmit }: CourseFormSheetProps) {
  const [form, setForm] = useState<CourseInput>(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm(initial ? { ...initial } : emptyForm); setError(''); }
  }, [open, initial]);

  const update = <K extends keyof CourseInput,>(key: K, value: CourseInput[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (![form.code, form.name, form.description, form.instructor].every((s) => s.trim())) { setError('Completa todos los campos del curso.'); return; }
    onSubmit(form);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={initial ? 'Editar curso' : 'Nuevo curso'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Código" required value={form.code} onChange={(e) => update('code', e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="course-semester">
              Semestre
            </label>
            <select
              id="course-semester"
              value={form.semester}
              onChange={(e) => update('semester', e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-white px-3.5 text-[15px] text-ink focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/30">
              
              {SEMESTERS.map((s) =>
              <option key={s} value={s}>
                  {s} semestre
                </option>
              )}
            </select>
          </div>
        </div>
        <Input label="Nombre del curso" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink" htmlFor="course-description">
            Descripción
          </label>
          <textarea
            id="course-description"
            required
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full resize-none rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/30" />
          
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Créditos"
            type="number"
            min={1}
            max={6}
            required
            value={form.credits}
            onChange={(e) => update('credits', Number(e.target.value))} />
          
          <Input label="Docente titular" required value={form.instructor} onChange={(e) => update('instructor', e.target.value)} />
        </div>
        <Button type="submit" fullWidth>
          {initial ? 'Guardar cambios' : 'Crear curso'}
        </Button>
      </form>
    </BottomSheet>);

}
