import { supabase, isSupabaseConfigured, handleSupabaseError } from '../../lib/supabase';
import { EVENT_STATUS } from '../../constants/status';

/**
 * Events Service
 * Handles all CRUD operations for events via Supabase
 */

const EVENTS_BUCKET =
  import.meta.env.VITE_SUPABASE_EVENTS_BUCKET ||
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  'events';

const resolvePosterUrl = (posterValue) => {
  if (!posterValue) return null;
  if (/^https?:\/\//i.test(posterValue)) return posterValue;

  const { data } = supabase.storage.from(EVENTS_BUCKET).getPublicUrl(posterValue);
  return data?.publicUrl || null;
};

const mapEvent = (event) => {
  if (!event) return null;

  const normalizedRegistrationEnabled =
    event.registration_enabled ?? event.registrationEnabled;
  const normalizedRegistrationStatus =
    event.registration_status ?? event.registrationStatus;
  const rawPoster = event.poster_path || event.poster_url || null;
  const posterUrl = resolvePosterUrl(rawPoster);

  return {
    ...event,
    date: event.event_date ?? event.date,
    time: event.start_time ?? event.time,
    attendees: event.attendees_count ?? event.attendees ?? 0,
    poster_path: rawPoster,
    poster_url: posterUrl,
    image: posterUrl,
    registrationUrl: event.registration_url ?? event.registrationUrl ?? null,
    registrationButtonText:
      event.registration_button_text ?? event.registrationButtonText ?? null,
    registrationDeadline:
      event.registration_deadline ?? event.registrationDeadline ?? null,
    registrationEnabled:
      normalizedRegistrationEnabled == null ? true : Boolean(normalizedRegistrationEnabled),
    registrationStatus: normalizedRegistrationStatus || 'open',
  };
};

const mapEvents = (events) => (Array.isArray(events) ? events.map(mapEvent) : []);

/**
 * Get all events
 */
export async function getEvents() {
  try {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return { data: [], error: handleSupabaseError(error) };
    }

    return { data: mapEvents(data || []), error: null };
  } catch (err) {
    console.error('Error in getEvents:', err);
    return { data: [], error: handleSupabaseError(err) };
  }
}

/**
 * Get event by ID
 */
export async function getEventById(id) {
  try {
    if (!isSupabaseConfigured) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: mapEvent(data), error: null };
  } catch (err) {
    console.error('Error in getEventById:', err);
    return { data: null, error: handleSupabaseError(err) };
  }
}

/**
 * Create new event
 */
export async function createEvent(eventData) {
  try {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'Supabase is not configured' } };
    }

    const allowedStatuses = [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED];
    const sanitizedStatus = allowedStatuses.includes(eventData.status) ? eventData.status : EVENT_STATUS.DRAFT;

    const insertPayload = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      category: eventData.category || 'general',
      capacity: eventData.capacity ? Number(eventData.capacity) : 0,
      status: sanitizedStatus,
      event_date: eventData.date ?? eventData.event_date,
      start_time: eventData.time ?? eventData.start_time,
      attendees_count: eventData.attendees_count ?? 0,
      registration_url:
        eventData.registrationUrl ?? eventData.registration_url ?? null,
      registration_button_text:
        eventData.registrationButtonText ?? eventData.registration_button_text ?? null,
      registration_enabled:
        eventData.registrationEnabled == null ? true : Boolean(eventData.registrationEnabled),
      registration_status: eventData.registrationStatus || 'open',
      registration_deadline: eventData.registration_deadline || null,
      featured: Boolean(eventData.featured),
      poster_url: eventData.poster_url || eventData.posterPath || null,
    };

    const { data, error } = await supabase
      .from('events')
      .insert([insertPayload])
      .select('*')
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: mapEvent(data), error: null };
  } catch (err) {
    console.error('Error in createEvent:', err);
    return { data: null, error: handleSupabaseError(err) };
  }
}

/**
 * Update event
 */
export async function updateEvent(id, eventData) {
  try {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'Supabase is not configured' } };
    }

    const allowedStatuses = [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED];
    const sanitizedStatus = allowedStatuses.includes(eventData.status) ? eventData.status : EVENT_STATUS.DRAFT;

    const updatePayload = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      category: eventData.category,
      capacity: eventData.capacity ? Number(eventData.capacity) : undefined,
      status: sanitizedStatus,
      event_date: eventData.date ?? eventData.event_date,
      start_time: eventData.time ?? eventData.start_time,
      attendees_count: eventData.attendees_count ?? eventData.attendees,
      registration_url:
        eventData.registrationUrl ?? eventData.registration_url,
      registration_button_text:
        eventData.registrationButtonText ?? eventData.registration_button_text,
      registration_enabled:
        eventData.registrationEnabled == null ? true : Boolean(eventData.registrationEnabled),
      registration_status: eventData.registrationStatus || 'open',
      registration_deadline: eventData.registration_deadline || null,
      featured:
        eventData.featured == null
          ? undefined
          : Boolean(eventData.featured),
      poster_url: eventData.poster_url || eventData.posterPath || undefined,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: mapEvent(data), error: null };
  } catch (err) {
    console.error('Error in updateEvent:', err);
    return { data: null, error: handleSupabaseError(err) };
  }
}

/**
 * Delete event
 */
export async function deleteEvent(id) {
  try {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase is not configured' } };
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: handleSupabaseError(error) };
    }

    return { error: null };
  } catch (err) {
    console.error('Error in deleteEvent:', err);
    return { error: handleSupabaseError(err) };
  }
}

/**
 * Search events by title, location, or category
 */
export async function searchEvents(query) {
  try {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(
        `title.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%`
      );

    if (error) {
      return { data: [], error: handleSupabaseError(error) };
    }

    return { data: mapEvents(data || []), error: null };
  } catch (err) {
    console.error('Error in searchEvents:', err);
    return { data: [], error: handleSupabaseError(err) };
  }
}

/**
 * Get events by category
 */
export async function getEventsByCategory(category) {
  try {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('category', category);

    if (error) {
      return { data: [], error: handleSupabaseError(error) };
    }

    return { data: mapEvents(data || []), error: null };
  } catch (err) {
    console.error('Error in getEventsByCategory:', err);
    return { data: [], error: handleSupabaseError(err) };
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(limit = 5) {
  try {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('status', [EVENT_STATUS.PUBLISHED])
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: [], error: handleSupabaseError(error) };
    }

    return { data: mapEvents(data || []), error: null };
  } catch (err) {
    console.error('Error in getUpcomingEvents:', err);
    return { data: [], error: handleSupabaseError(err) };
  }
}
