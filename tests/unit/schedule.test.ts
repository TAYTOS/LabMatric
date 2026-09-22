import { describe, expect, it } from 'vitest';
import { hasScheduleConflict, timeToMinutes } from '../../src/utils/schedule';

describe('schedule rules', () => {
  it('detects overlapping times on the same day but not touching or different-day sessions', () => {
    const base = { day: 'Lunes' as const, startTime: '10:00', endTime: '11:00' };
    expect(hasScheduleConflict(base, { day: 'Lunes', startTime: '10:30', endTime: '11:30' })).toBe(true);
    expect(hasScheduleConflict(base, { day: 'Lunes', startTime: '11:00', endTime: '12:00' })).toBe(false);
    expect(hasScheduleConflict(base, { day: 'Martes', startTime: '10:30', endTime: '11:30' })).toBe(false);
  });

  it('converts a 24-hour time into minutes', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('14:35')).toBe(875);
  });
});
