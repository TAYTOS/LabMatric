import { describe, expect, it } from 'vitest';
import {
  cancelStudentEnrollment,
  enrollStudent,
  joinWaitlist,
  loadAcademicState,
  processSyncQueue,
  queueEnrollment,
  toggleFavoriteGroup,
  validAcademicState,
} from '../../src/services/enrollmentService';

describe('enrollmentService', () => {
  it('enrolls once, increases capacity, and rejects a duplicate course enrollment', () => {
    const initial = loadAcademicState();
    const enrolled = enrollStudent(initial, 'new-student', 'c1', 'g1a');
    expect(enrolled.result.success).toBe(true);
    expect(enrolled.state.groups.find((group) => group.id === 'g1a')?.enrolled).toBe(16);
    const duplicate = enrollStudent(enrolled.state, 'new-student', 'c1', 'g1b');
    expect(duplicate.result).toEqual({ success: false, error: 'already_enrolled' });
  });

  it('rejects full groups and schedule conflicts without modifying state', () => {
    const initial = loadAcademicState();
    expect(enrollStudent(initial, 'new-student', 'c2', 'g2a').result).toEqual({ success: false, error: 'full' });
    expect(enrollStudent(initial, 'u1', 'c4', 'g4b').result).toEqual({ success: false, error: 'conflict' });
  });

  it('cancels exactly once, restores a seat, and notifies the first waitlisted student', () => {
    const initial = loadAcademicState();
    const withWaitlist = joinWaitlist({
      ...initial,
      groups: initial.groups.map((group) => group.id === 'g1a' ? { ...group, enrolled: group.capacity } : group),
    }, 'waiting-student', 'g1a');
    const enrolled = enrollStudent({ ...withWaitlist, groups: withWaitlist.groups.map((group) => group.id === 'g1a' ? { ...group, enrolled: 15 } : group) }, 'new-student', 'c1', 'g1a');
    if (!enrolled.result.success || enrolled.result.queued) throw new Error('Expected an immediate enrollment');
    const cancelled = cancelStudentEnrollment(enrolled.state, enrolled.result.enrollment.id);
    expect(cancelled).not.toBeNull();
    expect(cancelled?.groups.find((group) => group.id === 'g1a')?.enrolled).toBe(15);
    expect(cancelled?.waitlist[0]?.status).toBe('notified');
    expect(cancelled?.notifications[1]?.type).toBe('waitlist_available');
    expect(cancelStudentEnrollment(cancelled!, enrolled.result.enrollment.id)).toBeNull();
  });

  it('toggles favorites and preserves a valid snapshot', () => {
    const initial = loadAcademicState();
    const saved = toggleFavoriteGroup(initial, 'u1', 'g1a');
    expect(saved.favorites).toHaveLength(1);
    expect(validAcademicState(saved)).toBe(true);
    expect(toggleFavoriteGroup(saved, 'u1', 'g1a').favorites).toHaveLength(0);
  });

  it('queues a disconnected enrollment and applies it through the same rules on reconnection', () => {
    const initial = loadAcademicState();
    const queued = queueEnrollment(initial, 'offline-student', 'c1', 'g1a');
    if (!queued.result.success || !queued.result.queued) throw new Error('Expected a queued enrollment');
    expect(queued.state.syncActions[0]?.status).toBe('pending');
    const processed = processSyncQueue(queued.state);
    expect(processed.syncActions[0]?.status).toBe('applied');
    expect(processed.enrollments.some((enrollment) => enrollment.studentId === 'offline-student' && enrollment.groupId === 'g1a')).toBe(true);
  });

  it('marks an offline action rejected when capacity changes before reconnection', () => {
    const initial = loadAcademicState();
    const queued = queueEnrollment(initial, 'offline-student', 'c1', 'g1a');
    const fullBeforeReconnect = { ...queued.state, groups: queued.state.groups.map((group) => group.id === 'g1a' ? { ...group, enrolled: group.capacity } : group) };
    const processed = processSyncQueue(fullBeforeReconnect);
    expect(processed.syncActions[0]).toMatchObject({ status: 'rejected', error: 'full' });
  });
});
