import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppNotification, Course, Enrollment, EnrollResult, FavoriteGroup, LabGroup, SyncAction, WaitlistEntry } from '../types';
import {
  AcademicState,
  cancelStudentEnrollment,
  enrollStudent,
  joinWaitlist,
  leaveWaitlist,
  loadAcademicState,
  processSyncQueue,
  queueEnrollment,
  saveAcademicState,
  toggleFavoriteGroup,
} from '../services/enrollmentService';
import { isGroup } from '../services/validators';
import { usePwa } from './PwaContext';
import { useAuth } from './AuthContext';

export type CourseInput = Omit<Course, 'id' | 'groupIds'>;
export type GroupInput = Omit<LabGroup, 'id' | 'courseId' | 'enrolled'>;

interface EnrollmentContextValue {
  courses: Course[];
  groups: LabGroup[];
  enrollments: Enrollment[];
  notifications: AppNotification[];
  favorites: FavoriteGroup[];
  waitlist: WaitlistEntry[];
  syncActions: SyncAction[];
  unreadCount: number;
  pendingSyncCount: number;
  getCourseById: (id: string) => Course | undefined;
  getGroupById: (id: string) => LabGroup | undefined;
  getGroupsForCourse: (courseId: string) => LabGroup[];
  getEnrollmentsForStudent: (studentId: string) => Enrollment[];
  getFavoritesForStudent: (studentId: string) => FavoriteGroup[];
  getWaitlistEntry: (studentId: string, groupId: string) => WaitlistEntry | undefined;
  isFavorite: (studentId: string, groupId: string) => boolean;
  enroll: (studentId: string, courseId: string, groupId: string) => Promise<EnrollResult>;
  cancelEnrollment: (enrollmentId: string, reason?: string) => Promise<{ success: boolean }>;
  toggleFavorite: (groupId: string) => void;
  joinGroupWaitlist: (groupId: string) => void;
  leaveGroupWaitlist: (groupId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addCourse: (input: CourseInput) => void;
  updateCourse: (id: string, patch: Partial<CourseInput>) => void;
  deleteCourse: (id: string) => void;
  addGroup: (courseId: string, input: GroupInput) => void;
  updateGroup: (id: string, patch: Partial<GroupInput>) => void;
  deleteGroup: (id: string) => void;
}

const EnrollmentContext = createContext<EnrollmentContextValue | undefined>(undefined);

export function EnrollmentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { online } = usePwa();
  const [state, setState] = useState(loadAcademicState);
  const current = useRef(state);
  const { courses, groups, enrollments } = state;
  const notifications = state.notifications.filter((notification) => !notification.studentId || notification.studentId === user?.id);

  const commit = (next: AcademicState) => {
    current.current = next;
    saveAcademicState(next);
    setState(next);
  };

  useEffect(() => {
    if (!online || !current.current.syncActions.some((action) => action.status === 'pending')) return;
    commit(processSyncQueue(current.current));
  }, [online]);

  const setCourses = (update: (previous: Course[]) => Course[]) => commit({ ...current.current, courses: update(current.current.courses) });
  const setGroups = (update: (previous: LabGroup[]) => LabGroup[]) => commit({ ...current.current, groups: update(current.current.groups) });
  const setNotifications = (update: (previous: AppNotification[]) => AppNotification[]) => commit({ ...current.current, notifications: update(current.current.notifications) });
  const getCourseById = (id: string) => courses.find((course) => course.id === id);
  const getGroupById = (id: string) => groups.find((group) => group.id === id);
  const getGroupsForCourse = (courseId: string) => groups.filter((group) => group.courseId === courseId);
  const getEnrollmentsForStudent = (studentId: string) => enrollments.filter((enrollment) => enrollment.studentId === studentId).sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate));
  const getFavoritesForStudent = (studentId: string) => state.favorites.filter((favorite) => favorite.studentId === studentId);
  const getWaitlistEntry = (studentId: string, groupId: string) => state.waitlist.find((entry) => entry.studentId === studentId && entry.groupId === groupId && entry.status !== 'removed');
  const isFavorite = (studentId: string, groupId: string) => state.favorites.some((favorite) => favorite.studentId === studentId && favorite.groupId === groupId);

  const enroll = async (studentId: string, courseId: string, groupId: string): Promise<EnrollResult> => {
    if (!user || user.id !== studentId || user.role !== 'student') return { success: false, error: 'unknown' };
    const outcome = online
      ? enrollStudent(current.current, studentId, courseId, groupId)
      : queueEnrollment(current.current, studentId, courseId, groupId);
    if (outcome.result.success) commit(outcome.state);
    return outcome.result;
  };

  const cancelEnrollment = async (id: string, reason?: string) => {
    const target = current.current.enrollments.find((enrollment) => enrollment.id === id);
    if (!user || !target || (user.role !== 'admin' && target.studentId !== user.id)) return { success: false };
    const next = cancelStudentEnrollment(current.current, id, reason);
    if (!next) return { success: false };
    commit(next);
    return { success: true };
  };

  const toggleFavorite = (groupId: string) => {
    if (user?.role !== 'student') return;
    commit(toggleFavoriteGroup(current.current, user.id, groupId));
  };
  const joinGroupWaitlist = (groupId: string) => {
    if (user?.role !== 'student') return;
    commit(joinWaitlist(current.current, user.id, groupId));
  };
  const leaveGroupWaitlist = (groupId: string) => {
    if (user?.role !== 'student') return;
    commit(leaveWaitlist(current.current, user.id, groupId));
  };

  const addCourse = (input: CourseInput) => {
    if (user?.role !== 'admin') return;
    setCourses((previous) => [...previous, { ...input, id: `c-${Date.now()}`, groupIds: [] }]);
  };
  const updateCourse = (id: string, patch: Partial<CourseInput>) => {
    if (user?.role !== 'admin') return;
    setCourses((previous) => previous.map((course) => course.id === id ? { ...course, ...patch } : course));
  };
  const deleteCourse = (id: string) => {
    if (user?.role !== 'admin' || current.current.enrollments.some((enrollment) => enrollment.courseId === id)) return;
    commit({ ...current.current, courses: current.current.courses.filter((course) => course.id !== id), groups: current.current.groups.filter((group) => group.courseId !== id) });
  };
  const addGroup = (courseId: string, input: GroupInput) => {
    if (user?.role !== 'admin') return;
    const group: LabGroup = { ...input, id: `g-${Date.now()}`, courseId, enrolled: 0 };
    if (!isGroup(group) || !current.current.courses.some((course) => course.id === courseId)) return;
    commit({
      ...current.current,
      groups: [...current.current.groups, group],
      courses: current.current.courses.map((course) => course.id === courseId ? { ...course, groupIds: [...course.groupIds, group.id] } : course),
    });
  };
  const updateGroup = (id: string, patch: Partial<GroupInput>) => {
    if (user?.role !== 'admin') return;
    setGroups((previous) => previous.map((group) => group.id === id && isGroup({ ...group, ...patch }) ? { ...group, ...patch } : group));
  };
  const deleteGroup = (id: string) => {
    if (user?.role !== 'admin' || current.current.enrollments.some((enrollment) => enrollment.groupId === id)) return;
    const group = groups.find((item) => item.id === id);
    if (!group) return;
    commit({
      ...current.current,
      groups: current.current.groups.filter((item) => item.id !== id),
      courses: current.current.courses.map((course) => course.id === group.courseId ? { ...course, groupIds: course.groupIds.filter((groupId) => groupId !== id) } : course),
    });
  };
  const markNotificationRead = (id: string) => setNotifications((previous) => previous.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
  const markAllNotificationsRead = () => setNotifications((previous) => previous.map((notification) => !notification.studentId || notification.studentId === user?.id ? { ...notification, read: true } : notification));

  const value: EnrollmentContextValue = {
    courses,
    groups,
    enrollments,
    notifications,
    favorites: state.favorites,
    waitlist: state.waitlist,
    syncActions: state.syncActions,
    unreadCount: notifications.filter((notification) => !notification.read).length,
    pendingSyncCount: state.syncActions.filter((action) => action.status === 'pending' && action.studentId === user?.id).length,
    getCourseById,
    getGroupById,
    getGroupsForCourse,
    getEnrollmentsForStudent,
    getFavoritesForStudent,
    getWaitlistEntry,
    isFavorite,
    enroll,
    cancelEnrollment,
    toggleFavorite,
    joinGroupWaitlist,
    leaveGroupWaitlist,
    markNotificationRead,
    markAllNotificationsRead,
    addCourse,
    updateCourse,
    deleteCourse,
    addGroup,
    updateGroup,
    deleteGroup,
  };
  return <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEnrollment(): EnrollmentContextValue {
  const context = useContext(EnrollmentContext);
  if (!context) throw new Error('useEnrollment requiere EnrollmentProvider');
  return context;
}
