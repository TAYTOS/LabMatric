export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  names: string;
  surnames: string;
  fullName: string;
  studentCode: string;
  email: string;
  password: string;
  program: string;
  semester: string;
  period: string;
  role: UserRole;
  avatarInitials: string;
}

export type DayOfWeek =
'Lunes' |
'Martes' |
'Miércoles' |
'Jueves' |
'Viernes' |
'Sábado';

export interface LabGroup {
  id: string;
  courseId: string;
  name: string;
  instructor: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  enrolled: number;
  deadline: string;
  topics: string[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  semester: string;
  credits: number;
  instructor: string;
  groupIds: string[];
}

export type EnrollmentStatus = 'activa' | 'pendiente' | 'cancelada' | 'completada';

interface EnrollmentBase {
  id: string;
  code: string;
  studentId: string;
  courseId: string;
  groupId: string;
  enrollmentDate: string;
}

export type ActiveEnrollment = EnrollmentBase & {
  status: 'activa' | 'pendiente';
  cancelledDate?: never;
  cancelReason?: never;
};

export type CancelledEnrollment = EnrollmentBase & {
  status: 'cancelada';
  cancelledDate: string;
  cancelReason?: string;
};

export type CompletedEnrollment = EnrollmentBase & {
  status: 'completada';
  cancelledDate?: never;
  cancelReason?: never;
};

// A discriminated union keeps historical fields out of active enrollments.
export type Enrollment = ActiveEnrollment | CancelledEnrollment | CompletedEnrollment;

export type NotificationType =
'enrollment_success' |
'upcoming_session' |
'deadline' |
'group_change' |
'cancellation' |
'waitlist_available' |
'offline_sync';

export interface AppNotification {
  studentId?: string;
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export type AvailabilityStatus = 'disponible' | 'pocas' | 'lleno';

export type EnrollErrorCode = 'already_enrolled' | 'full' | 'conflict' | 'unknown';

export type EnrollResult =
  | { success: true; enrollment: ActiveEnrollment; queued?: false }
  | { success: true; queued: true; action: SyncAction }
  | { success: false; error: EnrollErrorCode };

export type CancelResult = { success: true } | { success: false; error: 'unknown' | 'forbidden' };

export interface FavoriteGroup {
  id: string;
  studentId: string;
  groupId: string;
  createdAt: string;
}

export type WaitlistStatus = 'waiting' | 'notified' | 'removed';

export interface WaitlistEntry {
  id: string;
  studentId: string;
  groupId: string;
  createdAt: string;
  status: WaitlistStatus;
}

export interface SyncAction {
  id: string;
  type: 'enroll';
  studentId: string;
  courseId: string;
  groupId: string;
  createdAt: string;
  status: 'pending' | 'applied' | 'rejected';
  error?: EnrollErrorCode;
}

export type ThemePreference = 'light' | 'dark' | 'system';
