import { AppNotification, Course, Enrollment, FavoriteGroup, LabGroup, SyncAction, User, WaitlistEntry } from '../types';

const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: Record<string, unknown>, keys: string[]) => keys.every((k) => typeof v[k] === 'string' && (v[k] as string).trim().length > 0);
const list = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === 'string');
const integer = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const date = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));
const timestamp = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
export const isUser = (v: unknown): v is User => record(v) && strings(v, ['id', 'names', 'surnames', 'fullName', 'studentCode', 'email', 'password', 'program', 'semester', 'period', 'avatarInitials']) && ['student', 'admin'].includes(v.role as string);
export const isCourse = (v: unknown): v is Course => record(v) && strings(v, ['id', 'code', 'name', 'description', 'semester', 'instructor']) && integer(v.credits) && list(v.groupIds);
export const isGroup = (v: unknown): v is LabGroup => record(v) && strings(v, ['id', 'courseId', 'name', 'instructor', 'room']) && ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].includes(v.day as string) && [v.startTime, v.endTime].every((t) => typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t)) && (v.startTime as string) < (v.endTime as string) && integer(v.capacity) && integer(v.enrolled) && Number(v.enrolled) <= Number(v.capacity) && date(v.deadline) && list(v.topics);
export const isEnrollment = (v: unknown): v is Enrollment => {
  if (!record(v) || !strings(v, ['id', 'code', 'studentId', 'courseId', 'groupId']) || !date(v.enrollmentDate)) return false;
  if (v.status === 'cancelada') return date(v.cancelledDate) && (v.cancelReason === undefined || typeof v.cancelReason === 'string');
  return (v.status === 'activa' || v.status === 'pendiente' || v.status === 'completada') && v.cancelledDate === undefined && v.cancelReason === undefined;
};
export const isNotification = (v: unknown): v is AppNotification => record(v) && strings(v, ['id', 'title', 'message']) && ['enrollment_success', 'upcoming_session', 'deadline', 'group_change', 'cancellation', 'waitlist_available', 'offline_sync'].includes(v.type as string) && date(v.date) && typeof v.read === 'boolean' && (v.studentId === undefined || typeof v.studentId === 'string');
export const isFavorite = (v: unknown): v is FavoriteGroup => record(v) && strings(v, ['id', 'studentId', 'groupId']) && timestamp(v.createdAt);
export const isWaitlistEntry = (v: unknown): v is WaitlistEntry => record(v) && strings(v, ['id', 'studentId', 'groupId']) && timestamp(v.createdAt) && ['waiting', 'notified', 'removed'].includes(v.status as string);
export const isSyncAction = (v: unknown): v is SyncAction => record(v) && strings(v, ['id', 'studentId', 'courseId', 'groupId']) && timestamp(v.createdAt) && v.type === 'enroll' && ['pending', 'applied', 'rejected'].includes(v.status as string) && (v.error === undefined || ['already_enrolled', 'full', 'conflict', 'unknown'].includes(v.error as string));
export const arrayOf = <T extends { id: string }>(check: (v: unknown) => v is T) => (v: unknown): v is T[] => Array.isArray(v) && v.every(check) && new Set(v.map((item) => item.id)).size === v.length;
