import { describe, expect, it } from 'vitest';
import {
  buildEventSchedulePayload,
  formatEventDate,
  formatEventDateRange,
  formatEventSessionTime,
  formatEventTimeSummary,
  getEventSessions,
  getEventScheduleFormValues,
  normalizeEventDate,
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

  it('normalizes valid database dates and safely handles optional empty values', () => {
    expect(normalizeEventDate('2026-10-17', 'Start Date', true)).toBe('2026-10-17');
    expect(normalizeEventDate('', 'End Date')).toBeNull();
    expect(normalizeEventDate(null, 'End Date')).toBeNull();
    expect(normalizeEventDate(undefined, 'End Date')).toBeNull();
    expect(() => normalizeEventDate('', 'Start Date', true)).toThrow('Start Date is required.');
    expect(() => normalizeEventDate('2026-02-30', 'Start Date', true))
      .toThrow('Start Date must be a valid date in YYYY-MM-DD format.');
  });

  it('formats multi-day sessions with their dates and start/end times', () => {
    expect(formatEventTimeSummary({
      event_schedule: [
        { date: '2026-10-17', time: '15:00:00', end_time: '18:00:00' },
        { date: '2026-10-18', time: '15:00', end_time: '18:00' },
      ],
    })).toBe('17 Oct: 3:00 PM–6:00 PM · 18 Oct: 3:00 PM–6:00 PM');
  });

  it('formats single-day ranges and keeps missing times as TBA', () => {
    expect(formatEventTimeSummary({
      start_time: '15:00',
      end_time: '18:00',
    })).toBe('3:00 PM–6:00 PM');
    expect(formatEventTimeSummary({
      event_schedule: [{ date: '2026-10-17', time: null, end_time: '18:00' }],
    })).toBe('17 Oct: TBA');
    expect(formatEventTimeSummary({})).toBe('TBA');
  });

  it('formats a single session end time while leaving start-only display unchanged', () => {
    expect(formatEventSessionTime('11:00', '13:00')).toBe('11:00 AM–1:00 PM');
    expect(formatEventSessionTime('11:00', null)).toBe('11:00');
    expect(getEventSessions({
      event_date: '2026-12-06',
      event_schedule: [{ date: '2026-12-06', time: '11:00', end_time: '13:00' }],
    })).toEqual([{ date: '2026-12-06', time: '11:00 AM–1:00 PM' }]);
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

  it('stores a shared end time in the existing event_schedule JSON representation', () => {
    const values = {
      date: '2026-12-06',
      endDate: '',
      scheduleMode: 'shared',
      timeStatus: 'confirmed',
      time: '11:00',
      endTime: '13:00',
      sessions: [],
    };

    expect(validateEventSchedule(values)).toEqual({});
    expect(buildEventSchedulePayload(values)).toEqual({
      event_end_date: null,
      start_time: '11:00',
      event_schedule: [{ date: '2026-12-06', time: '11:00', end_time: '13:00' }],
    });
    expect(toEventServicePayload(values)).not.toHaveProperty('endTime');
    expect(getEventScheduleFormValues({
      event_date: '2026-12-06',
      start_time: '11:00',
      event_schedule: [{ date: '2026-12-06', time: '11:00', end_time: '13:00' }],
    })).toMatchObject({
      scheduleMode: 'shared',
      timeStatus: 'confirmed',
      time: '11:00',
      endTime: '13:00',
    });
  });

  it('preserves per-session end times alongside multi-day TBA sessions', () => {
    expect(buildEventSchedulePayload({
      date: '2026-10-17',
      endDate: '2026-10-18',
      scheduleMode: 'sessions',
      sessions: [
        { date: '2026-10-17', timeStatus: 'confirmed', time: '15:30', endTime: '16:30' },
        { date: '2026-10-18', timeStatus: 'tba', time: '', endTime: '' },
      ],
    })).toEqual({
      event_end_date: '2026-10-18',
      start_time: '15:30',
      event_schedule: [
        { date: '2026-10-17', time: '15:30', end_time: '16:30' },
        { date: '2026-10-18', time: null },
      ],
    });
  });

  it('rejects end times that are not later than the confirmed start time', () => {
    expect(validateEventSchedule({
      date: '2026-12-06',
      scheduleMode: 'shared',
      timeStatus: 'confirmed',
      time: '11:00',
      endTime: '10:59',
    })).toMatchObject({
      endTime: 'End Time must be later than the start time',
    });
    expect(validateEventSchedule({
      date: '2026-12-06',
      scheduleMode: 'sessions',
      sessions: [{
        date: '2026-12-06',
        timeStatus: 'confirmed',
        time: '11:00',
        endTime: '11:00',
      }],
    })).toHaveProperty('schedule');
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
