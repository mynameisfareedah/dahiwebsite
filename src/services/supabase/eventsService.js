import { supabase, isSupabaseConfigured, handleSupabaseError } from '../../lib/supabase';

/**
 * Events Service
 * Handles all CRUD operations for events via Supabase
 * Falls back to mock data if Supabase is not configured
 */

const mapEvent = (event) => {
  if (!event) return null;

  return {
    ...event,
    date: event.event_date ?? event.date,
    time: event.start_time ?? event.time,
    attendees: event.attendees_count ?? event.attendees ?? 0,
  };
};

const mapEvents = (events) => (Array.isArray(events) ? events.map(mapEvent) : []);

// Mock data fallback
const mockEvents = [
  {
    id: '1',
    title: 'Women\'s Health Seminar',
    description: 'Comprehensive seminar on women\'s health and wellness',
    date: '2026-08-15',
    time: '10:00',
    location: 'DAHI Community Center',
    category: 'health',
    capacity: 50,
    attendees: 32,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
  },
  {
    id: '2',
    title: 'Mental Health Workshop',
    description: 'Interactive workshop on mental wellness and stress management',
    date: '2026-08-22',
    time: '14:00',
    location: 'Virtual - Zoom',
    category: 'wellness',
    capacity: 100,
    attendees: 45,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
  },
  {
    id: '3',
    title: 'Community Outreach Day',
    description: 'Community engagement and resource sharing event',
    date: '2026-09-05',
    time: '09:00',
    location: 'Downtown Park',
    category: 'outreach',
    capacity: 200,
    attendees: 120,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
  },
  {
    id: '4',
    title: 'Educational Forum',
    description: 'Forum discussing education and empowerment',
    date: '2026-07-30',
    time: '18:00',
    location: 'DAHI Headquarters',
    category: 'education',
    capacity: 75,
    attendees: 62,
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
  },
];

/**
 * Get all events
 */
export async function getEvents() {
  try {
    if (!isSupabaseConfigured) {
      return { data: mockEvents, error: null };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return { data: mapEvents(mockEvents), error: handleSupabaseError(error) };
    }

    return { data: mapEvents(data || mockEvents), error: null };
  } catch (err) {
    console.error('Error in getEvents:', err);
    return { data: mockEvents, error: handleSupabaseError(err) };
  }
}

/**
 * Get event by ID
 */
export async function getEventById(id) {
  try {
    if (!isSupabaseConfigured) {
      const mockEvent = mockEvents.find((e) => e.id === id);
      return { data: mockEvent, error: null };
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
      const newEvent = {
        id: String(Math.random()),
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attendees: 0,
      };
      mockEvents.push(newEvent);
      return { data: newEvent, error: null };
    }

    const insertPayload = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      category: eventData.category || 'general',
      capacity: eventData.capacity ? Number(eventData.capacity) : 0,
      status: eventData.status || 'scheduled',
      event_date: eventData.date ?? eventData.event_date,
      start_time: eventData.time ?? eventData.start_time,
      attendees_count: eventData.attendees_count ?? 0,
    };

    const { data, error } = await supabase
      .from('events')
      .insert([insertPayload])
      .select('id,title,description,location,category,capacity,status,event_date,start_time,attendees_count,created_at,updated_at,created_by')
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
      const index = mockEvents.findIndex((e) => e.id === id);
      if (index !== -1) {
        mockEvents[index] = { ...mockEvents[index], ...eventData, updated_at: new Date().toISOString() };
        return { data: mockEvents[index], error: null };
      }
      return { data: null, error: { message: 'Event not found' } };
    }

    const updatePayload = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      category: eventData.category,
      capacity: eventData.capacity ? Number(eventData.capacity) : undefined,
      status: eventData.status,
      event_date: eventData.date ?? eventData.event_date,
      start_time: eventData.time ?? eventData.start_time,
      attendees_count: eventData.attendees_count ?? eventData.attendees,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', id)
      .select('id,title,description,location,category,capacity,status,event_date,start_time,attendees_count,created_at,updated_at,created_by')
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
      const index = mockEvents.findIndex((e) => e.id === id);
      if (index !== -1) {
        mockEvents.splice(index, 1);
        return { error: null };
      }
      return { error: { message: 'Event not found' } };
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
      const q = query.toLowerCase();
      return {
        data: mockEvents.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q)
        ),
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(
        `title.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%`
      );

    if (error) {
      return { data: mockEvents, error: handleSupabaseError(error) };
    }

    return { data: mapEvents(data || mockEvents), error: null };
  } catch (err) {
    console.error('Error in searchEvents:', err);
    return { data: mapEvents(mockEvents), error: handleSupabaseError(err) };
  }
}

/**
 * Get events by category
 */
export async function getEventsByCategory(category) {
  try {
    if (!isSupabaseConfigured) {
      return {
        data: mockEvents.filter((e) => e.category === category),
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('category', category);

    if (error) {
      return { data: mockEvents, error: handleSupabaseError(error) };
    }

    return { data: mapEvents(data || mockEvents), error: null };
  } catch (err) {
    console.error('Error in getEventsByCategory:', err);
    return { data: mapEvents(mockEvents), error: handleSupabaseError(err) };
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(limit = 5) {
  try {
    if (!isSupabaseConfigured) {
      return {
        data: mockEvents
          .filter((e) => e.status === 'scheduled')
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, limit),
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'scheduled')
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: mockEvents, error: handleSupabaseError(error) };
    }

    return { data: mapEvents(data || mockEvents), error: null };
  } catch (err) {
    console.error('Error in getUpcomingEvents:', err);
    return { data: mockEvents, error: handleSupabaseError(err) };
  }
}
