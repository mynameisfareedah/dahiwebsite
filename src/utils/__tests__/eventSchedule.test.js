import { describe, expect, it } from 'vitest';
import {
  buildEventSchedulePayload,
  formatEventDate,
  formatEventDateRange,
  getEventScheduleFormValues,
  toEventServicePayload,
  validateEventSchedule,
} from '../eventSchedule';

describe('event scheduling helpers', () => {
  it('formats date-only values as calendar dates without timezone shifts', () => {
    expect(formatEventDate('2026-10-17')).toBe('17 October 2026');
    expect(formatEventDateRange('2026-10-17', '2026-10-18')).toBe('17–18 October 2026');
    expect(formatEventDateRange('2026-10-17', '2026-11-02')).toBe('17 October–2 November 2026');
    expect(formatEventDateRange('2026-10-17', null)).toBe('17 October 2026');
  });

  it('rejects an End Date before the required Start Date', () => {
    expect(validateEventSchedule({
      date: '2026-10-18',
      endDate: '2026-10-17',
      scheduleMode: 'shared',
      timeStatus: 'tba',
      time: '',
    })).toMatchObject({
      endDate: 'End Date must not precede Start Date',
    });
  });

  it('allows TBA without storing a fake time', () => {
    const values = {
      date: '2026-10-17',
      endDate: '',
      scheduleMode: 'shared',
      timeStatus: 'tba',
      time: '',
    };

    expect(validateEventSchedule(values)).toEqual({});
    expect(buildEventSchedulePayload(values)).toEqual({
      event_end_date: null,
      start_time: null,
      event_schedule: [{ date: '2026-10-17', time: null }],
    });
  });

  it('stores separate confirmed and TBA times for one multi-day event', () => {
    const payload = buildEventSchedulePayload({
      date: '2026-10-17',
      endDate: '2026-10-18',
      scheduleMode: 'sessions',
      sessions: [
        { date: '2026-10-17', timeStatus: 'confirmed', time: '15:30' },
        { date: '2026-10-18', timeStatus: 'tba', time: '' },
      ],
    });

    expect(payload).toEqual({
      event_end_date: '2026-10-18',
      start_time: '15:30',
      event_schedule: [
        { date: '2026-10-17', time: '15:30' },
        { date: '2026-10-18', time: null },
      ],
    });
  });

  it('keeps old Events on their legacy confirmed time when opened for editing', () => {
    const formValues = getEventScheduleFormValues({
      event_date: '2025-11-10',
      start_time: '10:00:00',
      capacity: 25,
    });

    expect(formValues).toMatchObject({
      date: '2025-11-10',
      endDate: '',
      scheduleMode: 'shared',
      timeStatus: 'confirmed',
      time: '10:00',
    });
    expect(toEventServicePayload({ ...formValues, title: 'Historical event' })).toMatchObject({
      start_time: '10:00',
      event_end_date: null,
      event_schedule: null,
    });
    expect(toEventServicePayload({ ...formValues, capacity: 25 })).not.toHaveProperty('capacity');
  });
});
