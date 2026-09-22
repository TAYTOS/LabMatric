import { initialCourses, initialEnrollments, initialGroups, initialNotifications } from '../data/mockData';
import {
  ActiveEnrollment,
  AppNotification,
  CancelledEnrollment,
  Course,
  Enrollment,
  EnrollErrorCode,
  EnrollResult,
  FavoriteGroup,
  LabGroup,
  SyncAction,
  WaitlistEntry,
} from '../types';
import { createId } from '../utils/id';
import { hasScheduleConflict } from '../utils/schedule';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import {
  arrayOf,
  isCourse,
  isEnrollment,
  isFavorite,
  isGroup,
  isNotification,
  isSyncAction,
  isWaitlistEntry,
} from './validators';

export interface AcademicState {
  courses: Course[];
  groups: LabGroup[];
  enrollments: Enrollment[];
  notifications: AppNotification[];
  favorites: FavoriteGroup[];
  waitlist: WaitlistEntry[];
  syncActions: SyncAction[];
}

// Kept stable so people testing the original laboratory demo retain their data.
export const ACADEMIC_KEY = 'courselab_academic_v1';

const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();

export const isActive = (enrollment: Enrollment): enrollment is ActiveEnrollment =>
  enrollment.status === 'activa' || enrollment.status === 'pendiente';

function seedAcademicState(): AcademicState {
  return {
    courses: initialCourses.map((course) => ({ ...course, groupIds: [...course.groupIds] })),
    groups: initialGroups.map((group) => ({ ...group, topics: [...group.topics] })),
    enrollments: initialEnrollments.map((enrollment) => ({ ...enrollment })),
    notifications: initialNotifications.map((notification) => ({
      ...notification,
      studentId: ['enrollment_success', 'upcoming_session', 'cancellation'].includes(notification.type) ? 'u1' : undefined,
    })),
    favorites: [],
    waitlist: [],
    syncActions: [],
  };
}

export function validAcademicState(value: unknown): value is AcademicState {
  if (!value || typeof value !== 'object') return false;
  const state = value as AcademicState;
  if (
    !arrayOf(isCourse)(state.courses) ||
    !arrayOf(isGroup)(state.groups) ||
    !arrayOf(isEnrollment)(state.enrollments) ||
    !arrayOf(isNotification)(state.notifications) ||
    !arrayOf(isFavorite)(state.favorites) ||
    !arrayOf(isWaitlistEntry)(state.waitlist) ||
    !arrayOf(isSyncAction)(state.syncActions)
  ) return false;

  const activeEnrollmentKeys = new Set<string>();
  const favoriteKeys = new Set<string>();
  const waitlistKeys = new Set<string>();

  return state.groups.every((group) =>
    state.courses.some((course) => course.id === group.courseId) &&
    group.enrolled >= state.enrollments.filter((enrollment) => enrollment.groupId === group.id && isActive(enrollment)).length,
  ) && state.courses.every((course) =>
    course.groupIds.length === state.groups.filter((group) => group.courseId === course.id).length &&
    course.groupIds.every((id) => state.groups.some((group) => group.id === id && group.courseId === course.id)),
  ) && state.enrollments.every((enrollment) => {
    if (!state.groups.some((group) => group.id === enrollment.groupId && group.courseId === enrollment.courseId)) return false;
    if (!isActive(enrollment)) return true;
    const key = `${enrollment.studentId}:${enrollment.courseId}`;
    if (activeEnrollmentKeys.has(key)) return false;
    activeEnrollmentKeys.add(key);
    return true;
  }) && state.favorites.every((favorite) => {
    const key = `${favorite.studentId}:${favorite.groupId}`;
    if (favoriteKeys.has(key) || !state.groups.some((group) => group.id === favorite.groupId)) return false;
    favoriteKeys.add(key);
    return true;
  }) && state.waitlist.every((entry) => {
    const key = `${entry.studentId}:${entry.groupId}`;
    if (waitlistKeys.has(key) || !state.groups.some((group) => group.id === entry.groupId)) return false;
    waitlistKeys.add(key);
    return true;
  }) && state.syncActions.every((action) =>
    state.groups.some((group) => group.id === action.groupId && group.courseId === action.courseId),
  );
}

function isPartialAcademicState(value: unknown): value is Partial<AcademicState> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function loadAcademicState(): AcademicState {
  const seed = seedAcademicState();
  const legacyCourses = loadFromStorage<Course[] | null>(`${STORAGE_KEYS.groups}_courses`, null, arrayOf(isCourse));
  const legacyGroups = loadFromStorage<LabGroup[] | null>(STORAGE_KEYS.groups, null, arrayOf(isGroup));
  const legacyEnrollments = loadFromStorage<Enrollment[] | null>(STORAGE_KEYS.enrollments, null, arrayOf(isEnrollment));
  const hasCompleteLegacyState = legacyCourses && legacyGroups && legacyEnrollments;
  const legacy: AcademicState = {
    ...seed,
    courses: hasCompleteLegacyState ? legacyCourses : seed.courses,
    groups: hasCompleteLegacyState ? legacyGroups : seed.groups,
    enrollments: hasCompleteLegacyState ? legacyEnrollments : seed.enrollments,
    notifications: loadFromStorage(STORAGE_KEYS.notifications, seed.notifications, arrayOf(isNotification)).map((notification) => ({
      ...notification,
      studentId: notification.studentId ?? (['enrollment_success', 'upcoming_session', 'cancellation'].includes(notification.type) ? 'u1' : undefined),
    })),
  };
  const persisted = loadFromStorage<Partial<AcademicState> | null>(ACADEMIC_KEY, null, isPartialAcademicState);
  const candidate: AcademicState = {
    ...legacy,
    ...persisted,
    favorites: persisted?.favorites ?? [],
    waitlist: persisted?.waitlist ?? [],
    syncActions: persisted?.syncActions ?? [],
  };
  return validAcademicState(candidate) ? candidate : legacy;
}

export const saveAcademicState = (state: AcademicState) => saveToStorage(ACADEMIC_KEY, state);

function enrollmentFailure(state: AcademicState, error: EnrollErrorCode): { state: AcademicState; result: EnrollResult } {
  return { state, result: { success: false, error } };
}

export function enrollStudent(
  state: AcademicState,
  studentId: string,
  courseId: string,
  groupId: string,
): { state: AcademicState; result: EnrollResult } {
  const group = state.groups.find((item) => item.id === groupId && item.courseId === courseId);
  const course = state.courses.find((item) => item.id === courseId);
  if (!group || !course) return enrollmentFailure(state, 'unknown');

  const activeEnrollments = state.enrollments.filter((item) => item.studentId === studentId && isActive(item));
  if (activeEnrollments.some((item) => item.courseId === courseId)) return enrollmentFailure(state, 'already_enrolled');
  if (group.enrolled >= group.capacity) return enrollmentFailure(state, 'full');
  if (activeEnrollments.some((item) => {
    const otherGroup = state.groups.find((candidate) => candidate.id === item.groupId);
    return otherGroup !== undefined && hasScheduleConflict(otherGroup, group);
  })) return enrollmentFailure(state, 'conflict');

  const id = createId();
  const enrollment: ActiveEnrollment = {
    id,
    code: `MAT-2026-${id.slice(0, 8).toUpperCase()}`,
    studentId,
    courseId,
    groupId,
    status: 'activa',
    enrollmentDate: today(),
  };
  return {
    result: { success: true, enrollment },
    state: {
      ...state,
      groups: state.groups.map((item) => item.id === groupId ? { ...item, enrolled: item.enrolled + 1 } : item),
      enrollments: [enrollment, ...state.enrollments],
      waitlist: state.waitlist.map((entry) => entry.studentId === studentId && entry.groupId === groupId && entry.status !== 'removed' ? { ...entry, status: 'removed' } : entry),
      notifications: [{
        id: createId(),
        studentId,
        type: 'enrollment_success',
        title: 'Matrícula confirmada',
        message: `Tu matrícula en ${course.name} - ${group.name} fue registrada correctamente.`,
        date: enrollment.enrollmentDate,
        read: false,
      }, ...state.notifications],
    },
  };
}

export function queueEnrollment(
  state: AcademicState,
  studentId: string,
  courseId: string,
  groupId: string,
): { state: AcademicState; result: EnrollResult } {
  const groupExists = state.groups.some((group) => group.id === groupId && group.courseId === courseId);
  const courseExists = state.courses.some((course) => course.id === courseId);
  if (!groupExists || !courseExists) return enrollmentFailure(state, 'unknown');
  if (state.enrollments.some((enrollment) => enrollment.studentId === studentId && enrollment.courseId === courseId && isActive(enrollment))) {
    return enrollmentFailure(state, 'already_enrolled');
  }
  if (state.syncActions.some((action) => action.status === 'pending' && action.studentId === studentId && action.courseId === courseId)) {
    return enrollmentFailure(state, 'already_enrolled');
  }
  const action: SyncAction = { id: createId(), type: 'enroll', studentId, courseId, groupId, createdAt: now(), status: 'pending' };
  return { state: { ...state, syncActions: [...state.syncActions, action] }, result: { success: true, queued: true, action } };
}

export function processSyncQueue(state: AcademicState): AcademicState {
  let next = state;
  for (const action of state.syncActions.filter((item) => item.status === 'pending')) {
    const outcome = enrollStudent(next, action.studentId, action.courseId, action.groupId);
    if (outcome.result.success && !outcome.result.queued) {
      next = {
        ...outcome.state,
        syncActions: outcome.state.syncActions.map((item) => item.id === action.id ? { ...item, status: 'applied' } : item),
        notifications: [{
          id: createId(),
          studentId: action.studentId,
          type: 'offline_sync',
          title: 'Matrícula sincronizada',
          message: 'Tu solicitud guardada sin conexión fue aplicada al recuperar la conexión.',
          date: today(),
          read: false,
        }, ...outcome.state.notifications],
      };
    } else {
      const error = outcome.result.success ? 'unknown' : outcome.result.error;
      next = {
        ...next,
        syncActions: next.syncActions.map((item) => item.id === action.id ? { ...item, status: 'rejected', error } : item),
        notifications: [{
          id: createId(),
          studentId: action.studentId,
          type: 'offline_sync',
          title: 'No se pudo sincronizar una matrícula',
          message: 'La solicitud guardada sin conexión ya no cumple las reglas de matrícula.',
          date: today(),
          read: false,
        }, ...next.notifications],
      };
    }
  }
  return next;
}

export function toggleFavoriteGroup(state: AcademicState, studentId: string, groupId: string): AcademicState {
  const favorite = state.favorites.find((item) => item.studentId === studentId && item.groupId === groupId);
  if (favorite) return { ...state, favorites: state.favorites.filter((item) => item.id !== favorite.id) };
  if (!state.groups.some((group) => group.id === groupId)) return state;
  return { ...state, favorites: [...state.favorites, { id: createId(), studentId, groupId, createdAt: now() }] };
}

export function joinWaitlist(state: AcademicState, studentId: string, groupId: string): AcademicState {
  const group = state.groups.find((item) => item.id === groupId);
  if (!group || group.enrolled < group.capacity || state.waitlist.some((entry) => entry.studentId === studentId && entry.groupId === groupId && entry.status !== 'removed')) return state;
  const entry: WaitlistEntry = { id: createId(), studentId, groupId, createdAt: now(), status: 'waiting' };
  return { ...state, waitlist: [...state.waitlist, entry] };
}

export function leaveWaitlist(state: AcademicState, studentId: string, groupId: string): AcademicState {
  return { ...state, waitlist: state.waitlist.map((entry) => entry.studentId === studentId && entry.groupId === groupId && entry.status !== 'removed' ? { ...entry, status: 'removed' } : entry) };
}

export function cancelStudentEnrollment(state: AcademicState, id: string, reason?: string): AcademicState | null {
  const target = state.enrollments.find((enrollment) => enrollment.id === id && isActive(enrollment));
  if (!target) return null;
  const date = today();
  const availableWaiter = state.waitlist
    .filter((entry) => entry.groupId === target.groupId && entry.status === 'waiting')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  const courseName = state.courses.find((course) => course.id === target.courseId)?.name ?? 'el curso seleccionado';
  const cancelled: CancelledEnrollment = { ...target, status: 'cancelada', cancelledDate: date, ...(reason ? { cancelReason: reason } : {}) };
  const waitlistNotification: AppNotification | null = availableWaiter ? {
    id: createId(),
    studentId: availableWaiter.studentId,
    type: 'waitlist_available',
    title: 'Hay una vacante disponible',
    message: `Se liberó una vacante en ${courseName}. Puedes confirmar tu matrícula desde Guardados.`,
    date,
    read: false,
  } : null;
  return {
    ...state,
    enrollments: state.enrollments.map((enrollment) => enrollment.id === id ? cancelled : enrollment),
    groups: state.groups.map((group) => group.id === target.groupId ? { ...group, enrolled: Math.max(0, group.enrolled - 1) } : group),
    waitlist: availableWaiter ? state.waitlist.map((entry) => entry.id === availableWaiter.id ? { ...entry, status: 'notified' } : entry) : state.waitlist,
    notifications: [
      {
        id: createId(),
        studentId: target.studentId,
        type: 'cancellation',
        title: 'Matrícula cancelada',
        message: `Se canceló tu matrícula en ${courseName}. Tu vacante fue liberada.`,
        date,
        read: false,
      },
      ...(waitlistNotification ? [waitlistNotification] : []),
      ...state.notifications,
    ],
  };
}
