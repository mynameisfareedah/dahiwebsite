const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseCalendarDate(value) {
  if (typeof value !== 'string') return null;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day, date };
}

function getSchedule(event) {
  const schedule = event?.event_schedule ?? event?.schedule;
  return Array.isArray(schedule)
    ? schedule.filter((session) => session && typeof session === 'object')
    : [];
}

function normalizeTime(value) {
  return typeof value === 'string' ? value.slice(0, 5) : '';
}

export function formatEventDate(dateString) {
  const parsed = parseCalendarDate(dateString);
  if (!parsed) return dateString || '-';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed.date);
}

export function formatEventDateRange(startDate, endDate) {
  const start = parseCalendarDate(startDate);
  const end = parseCalendarDate(endDate);
  if (!start) return startDate || '-';
  if (!end || startDate === endDate) return formatEventDate(startDate);

  const startMonth = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  }).format(start.date);
  const endMonth = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  }).format(end.date);

  if (start.year === end.year && start.month === end.month) {
    return `${start.day}–${end.day} ${startMonth} ${start.year}`;
  }

  if (start.year === end.year) {
    return `${start.day} ${startMonth}–${end.day} ${endMonth} ${start.year}`;
  }

  return `${formatEventDate(startDate)} – ${formatEventDate(endDate)}`;
}

export function formatEventTimeSummary(event) {
  const schedule = getSchedule(event);
  if (schedule.length > 0) {
    return schedule.map((session) => {
      const parsedDate = parseCalendarDate(session.date);
      const dateLabel = parsedDate
        ? new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'short',
          timeZone: 'UTC',
        }).format(parsedDate.date)
        : session.date;
      const timeLabel = normalizeTime(session.time) || 'TBA';
      return dateLabel ? `${dateLabel}: ${timeLabel}` : timeLabel;
    }).join(' · ');
  }

  return normalizeTime(event?.start_time ?? event?.time) || 'TBA';
}

export function getEventSessions(event) {
  const schedule = getSchedule(event);
  if (schedule.length > 0) {
    return schedule.map((session) => ({
      date: session.date || event?.event_date || event?.date || '',
      time: normalizeTime(session.time),
    }));
  }

  return [{
    date: event?.event_date || event?.date || '',
    time: normalizeTime(event?.start_time ?? event?.time),
  }];
}

export function getEventScheduleFormValues(event = {}) {
  const date = event.event_date ?? event.date ?? '';
  const savedEndDate = event.event_end_date ?? event.endDate ?? '';
  const schedule = getSchedule(event);

  if (schedule.length > 0) {
    return {
      date,
      endDate: savedEndDate,
      scheduleMode: 'sessions',
      timeStatus: 'tba',
      time: '',
      sessions: schedule.map((session) => ({
        date: session.date || date,
        time: normalizeTime(session.time),
        timeStatus: session.time ? 'confirmed' : 'tba',
      })),
    };
  }

  const savedTime = normalizeTime(event.start_time ?? event.time);
  return {
    date,
    endDate: savedEndDate,
    scheduleMode: 'shared',
    timeStatus: savedTime ? 'confirmed' : 'tba',
    time: savedTime,
    sessions: [],
  };
}

export function validateEventSchedule(values) {
  const errors = {};
  const start = parseCalendarDate(values.date);
  const end = values.endDate ? parseCalendarDate(values.endDate) : null;

  if (values.date && !start) {
    errors.date = 'Enter a valid Start Date';
  }

  if (values.endDate && !end) {
    errors.endDate = 'Enter a valid End Date';
  } else if (start && end && values.endDate < values.date) {
    errors.endDate = 'End Date must not precede Start Date';
  }

  if (values.scheduleMode === 'sessions') {
    if (!Array.isArray(values.sessions) || values.sessions.length === 0) {
      errors.schedule = 'Add at least one event session';
      return errors;
    }

    const invalidSession = values.sessions.some((session) => {
      const sessionDate = parseCalendarDate(session.date);
      if (
        !sessionDate
        || session.date < values.date
        || (values.endDate ? session.date > values.endDate : session.date !== values.date)
      ) {
        return true;
      }
      return session.timeStatus === 'confirmed' && !normalizeTime(session.time);
    });

    if (invalidSession) {
      errors.schedule = 'Each session needs a date within the event range and a confirmed time or TBA';
    }
  } else if (values.timeStatus === 'confirmed' && !normalizeTime(values.time)) {
    errors.time = 'Time is required when the event time is confirmed';
  }

  return errors;
}

export function buildEventSchedulePayload(values) {
  const eventEndDate = values.endDate || null;

  if (values.scheduleMode === 'sessions') {
    const schedule = (values.sessions || []).map((session) => ({
      date: session.date,
      time: session.timeStatus === 'confirmed' ? normalizeTime(session.time) || null : null,
    }));
    return {
      event_end_date: eventEndDate,
      start_time: schedule[0]?.time || null,
      event_schedule: schedule,
    };
  }

  if (values.timeStatus === 'tba') {
    return {
      event_end_date: eventEndDate,
      start_time: null,
      event_schedule: [{ date: values.date, time: null }],
    };
  }

  return {
    event_end_date: eventEndDate,
    start_time: normalizeTime(values.time) || null,
    event_schedule: null,
  };
}

export function toEventServicePayload(values) {
  const eventValues = { ...values };
  ['scheduleMode', 'timeStatus', 'sessions', 'time', 'capacity'].forEach((field) => {
    delete eventValues[field];
  });

  return {
    ...eventValues,
    ...buildEventSchedulePayload(values),
  };
}
