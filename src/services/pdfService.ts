import type { jsPDF } from 'jspdf';
import { Course, Enrollment, LabGroup, User } from '../types';
import { formatDate } from '../utils/schedule';

function addDocumentHeader(document: jsPDF, title: string) {
  document.setFillColor(15, 118, 110);
  document.rect(0, 0, 210, 28, 'F');
  document.setTextColor(255, 255, 255);
  document.setFontSize(18);
  document.text('LabMatric', 16, 13);
  document.setFontSize(9);
  document.text('Demostración académica local', 16, 20);
  document.setTextColor(16, 42, 67);
  document.setFontSize(16);
  document.text(title, 16, 43);
}

function addField(document: jsPDF, label: string, value: string, y: number) {
  document.setFontSize(9);
  document.setTextColor(72, 91, 112);
  document.text(label.toUpperCase(), 16, y);
  document.setFontSize(11);
  document.setTextColor(16, 42, 67);
  const lines = document.splitTextToSize(value, 170);
  document.text(lines, 16, y + 6);
  return y + 10 + lines.length * 5;
}

export async function enrollmentCertificatePdf(enrollment: Enrollment, student: User, course: Course, group: LabGroup): Promise<Blob> {
  const { jsPDF: PdfDocument } = await import('jspdf');
  const document = new PdfDocument({ unit: 'mm', format: 'a4' });
  addDocumentHeader(document, 'Constancia de matrícula');
  let y = 56;
  y = addField(document, 'Código de matrícula', enrollment.code, y);
  y = addField(document, 'Estudiante', `${student.fullName} (${student.studentCode})`, y);
  y = addField(document, 'Curso', `${course.name} (${course.code})`, y);
  y = addField(document, 'Grupo y docente', `${group.name} - ${group.instructor}`, y);
  y = addField(document, 'Horario', `${group.day}, ${group.startTime}-${group.endTime} · ${group.room}`, y);
  y = addField(document, 'Fecha de matrícula', formatDate(enrollment.enrollmentDate), y);
  addField(document, 'Estado', enrollment.status, y);
  document.setFontSize(8);
  document.setTextColor(72, 91, 112);
  document.text('Documento generado localmente para fines de demostración. No es una constancia oficial.', 16, 276);
  return document.output('blob');
}

export async function enrollmentHistoryPdf(student: User, entries: Array<{ enrollment: Enrollment; course: Course; group: LabGroup }>): Promise<Blob> {
  const { jsPDF: PdfDocument } = await import('jspdf');
  const document = new PdfDocument({ unit: 'mm', format: 'a4' });
  addDocumentHeader(document, 'Historial de matrículas');
  let y = addField(document, 'Estudiante', `${student.fullName} (${student.studentCode})`, 56);
  if (entries.length === 0) {
    addField(document, 'Historial', 'No hay matrículas registradas.', y);
  } else {
    entries.forEach(({ enrollment, course, group }, index) => {
      if (y > 260) {
        document.addPage();
        y = 20;
      }
      document.setFillColor(244, 247, 251);
      document.roundedRect(14, y - 5, 182, 25, 2, 2, 'F');
      document.setFontSize(10);
      document.setTextColor(16, 42, 67);
      document.text(`${index + 1}. ${course.name} - ${group.name}`, 18, y + 2);
      document.setFontSize(8);
      document.setTextColor(72, 91, 112);
      document.text(`${group.day}, ${group.startTime}-${group.endTime} · ${enrollment.status} · ${formatDate(enrollment.enrollmentDate)}`, 18, y + 9);
      document.text(enrollment.code, 18, y + 15);
      y += 31;
    });
  }
  return document.output('blob');
}

export function downloadPdf(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
