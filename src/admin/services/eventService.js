import { supabase, isSupabaseConfigured, handleSupabaseError } from '../../lib/supabase';
import { EVENT_STATUS } from '../../constants/status';
import { logAudit } from './auditService';

const EVENT_TABLE = 'events';
const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_EVENTS_BUCKET ||
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  'events';
const MAX_EVENT_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function buildErrorResponse(error) {
  return {
    success: false,
    data: null,
    error: error || { message: 'An unknown error occurred' },
  };
}

function buildStorageError(error) {
  if (!error) return null;

  const message = String(error.message || error.msg || error.code || '');
  if (message.toLowerCase().includes('bucket not found')) {
    return {
      message:
        `Supabase storage bucket "${STORAGE_BUCKET}" was not found. ` +
        'Create the bucket in the Supabase dashboard or set VITE_SUPABASE_STORAGE_BUCKET in .env.local.',
    };
  }

  return error;
}

function buildSuccessResponse(data) {
  return {
    success: true,
    data,
    error: null,
  };
}

function normalizeEvent(event) {
  if (!event) return null;

  const normalizedRegistrationEnabled =
    event.registration_enabled ?? event.registrationEnabled;
  const normalizedRegistrationStatus =
    event.registration_status ?? event.registrationStatus;

  return {
    ...event,
    date: event.event_date ?? event.date ?? null,
    time: event.start_time ?? event.time ?? null,
    attendees: event.attendees_count ?? event.attendees ?? 0,
    featured: event.featured ?? false,
    published: event.status === EVENT_STATUS.PUBLISHED,
    registrationUrl: event.registration_url ?? event.registrationUrl ?? null,
    registrationButtonText:
      event.registration_button_text ?? event.registrationButtonText ?? null,
    registrationDeadline:
      event.registration_deadline ?? event.registrationDeadline ?? null,
    registrationEnabled:
      normalizedRegistrationEnabled == null ? true : Boolean(normalizedRegistrationEnabled),
    registrationStatus: normalizedRegistrationStatus || 'open',
  };
}

export function getEventImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function applyFilters(queryBuilder, options) {
  const { search, status, category, featured } = options;

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.or(
      `title.ilike.${searchTerm},slug.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},category.ilike.${searchTerm}`
    );
  }

  if (status && status !== 'all') {
    queryBuilder.eq('status', status);
  }

  if (category && category !== 'all') {
    queryBuilder.eq('category', category);
  }

  if (featured === true || featured === false) {
    queryBuilder.eq('featured', featured);
  }

  return queryBuilder;
}

function applySorting(queryBuilder, options) {
  const { sortBy = 'event_date', sortOrder = 'asc' } = options;
  return queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });
}

function applyPagination(queryBuilder, options) {
  const page = Math.max(1, Number(options.page || 1));
  const pageSize = Math.max(1, Number(options.pageSize || 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return queryBuilder.range(from, to);
}

async function getEventRecord(id) {
  // Validate ID format to prevent injection - should be UUID
  if (!id || typeof id !== 'string' || !/^[a-f0-9\-]{36}$/i.test(id)) {
    throw new Error('Invalid event ID format');
  }

  const { data, error } = await supabase
    .from(EVENT_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function updateEventStatus(id, status) {
  let oldData = null;
  try {
    oldData = await getEventRecord(id);
  } catch {
    oldData = null;
  }

  const { data, error } = await supabase
    .from(EVENT_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  try {
    await logAudit({
      action: 'UPDATE',
      module: 'Events',
      record_id: id,
      description: 'Updated event status',
      oldData,
      newData: data,
    });
  } catch (auditError) {
    console.error('Failed to log event update audit entry:', auditError);
  }

  return normalizeEvent(data);
}

async function uploadImage(file, folder = 'posters') {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  if (!file) {
    throw new Error('Please choose an image to upload.');
  }

  if (file.size > MAX_EVENT_IMAGE_SIZE_BYTES) {
    throw new Error('Image is too large. Maximum allowed size is 10MB.');
  }

  // Validate MIME type for security
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only image files are allowed.');
  }

  // Validate file extension matches expected format
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error('Invalid file extension. Only image files are allowed.');
  }

  const timestamp = Date.now();
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9\.]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const filePath = `${folder}/${timestamp}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw buildStorageError(error);
  }

  return data.Key || filePath;
}

export const eventService = {
  /**
   * Fetch events with optional filtering, sorting, and pagination.
   * @param {Object} options
   */
  async getEvents(options = {}) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse([]);
      }

      let query = supabase.from(EVENT_TABLE).select('*', { count: 'exact' });
      query = applyFilters(query, options);
      query = applySorting(query, options);
      query = applyPagination(query, options);

      const { data, error, count } = await query;
      if (error) {
        return buildErrorResponse(handleSupabaseError(error));
      }

      const items = (data || []).map(normalizeEvent);
      return buildSuccessResponse({ items, count });
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  /**
   * Get a single event by ID.
   * @param {string} id
   */
  async getEventById(id) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(null);
      }

      const record = await getEventRecord(id);
      return buildSuccessResponse(normalizeEvent(record));
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  async getEvent(id) {
    return this.getEventById(id);
  },

  /**
   * Create a new event.
   * @param {Object} data
   */
  async createEvent(data) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(null);
      }

      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser?.id) {
        return buildErrorResponse({ message: 'Unable to determine current user' });
      }

      const allowedStatuses = [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED];
      const sanitizedStatus = allowedStatuses.includes(data.status) ? data.status : EVENT_STATUS.DRAFT;

      const payload = {
        title: data.title,
        slug: (data.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'event',
        description: data.description || null,
        category: data.category || 'general',
        event_date: data.date || data.event_date || null,
        start_time: data.time || data.start_time || null,
        location: data.location || null,
        poster_url: data.poster_url || null,
        registration_url: data.registrationUrl || data.registration_url || null,
        registration_button_text:
          data.registrationButtonText || data.registration_button_text || null,
        registration_enabled:
          data.registrationEnabled == null ? true : Boolean(data.registrationEnabled),
        registration_status: data.registrationStatus || 'open',
        registration_deadline: data.registrationDeadline || data.registration_deadline || null,
        capacity: data.capacity != null ? Number(data.capacity) : 0,
        featured: Boolean(data.featured),
        status: sanitizedStatus,
        created_by: currentUser.id,
      };

      const { data: inserted, error } = await supabase
        .from(EVENT_TABLE)
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        return buildErrorResponse(handleSupabaseError(error));
      }

      try {
        await logAudit({
          action: 'CREATE',
          module: 'Events',
          record_id: inserted?.id ?? null,
          description: 'Created event',
          oldData: null,
          newData: inserted,
        });
      } catch (auditError) {
        console.error('Failed to log event create audit entry:', auditError);
      }

      return buildSuccessResponse(normalizeEvent(inserted));
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  /**
   * Update an existing event.
   * @param {string} id
   * @param {Object} data
   */
  async updateEvent(id, data) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(null);
      }

      const allowedStatuses = [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED];
      const sanitizedStatus = allowedStatuses.includes(data.status) ? data.status : EVENT_STATUS.DRAFT;

      const payload = {
        title: data.title,
        description: data.description || null,
        category: data.category || 'general',
        event_date: data.date || data.event_date || null,
        start_time: data.time || data.start_time || null,
        location: data.location || null,
        poster_url: data.poster_url || null,
        registration_url: data.registrationUrl || data.registration_url || null,
        registration_button_text:
          data.registrationButtonText || data.registration_button_text || null,
        registration_enabled:
          data.registrationEnabled == null ? true : Boolean(data.registrationEnabled),
        registration_status: data.registrationStatus || 'open',
        registration_deadline: data.registrationDeadline || data.registration_deadline || null,
        capacity: data.capacity != null ? Number(data.capacity) : 0,
        featured:
          data.featured == null
            ? undefined
            : Boolean(data.featured),
        status: sanitizedStatus,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from(EVENT_TABLE)
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return buildErrorResponse(handleSupabaseError(error));
      }

      try {
        await logAudit({
          action: 'UPDATE',
          module: 'Events',
          record_id: id,
          description: 'Updated event',
          oldData: null,
          newData: updated,
        });
      } catch (auditError) {
        console.error('Failed to log event update audit entry:', auditError);
      }

      return buildSuccessResponse(normalizeEvent(updated));
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  /**
   * Delete an event by ID.
   * @param {string} id
   */
  async deleteEvent(id) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(true);
      }

      let oldData = null;
      try {
        oldData = await getEventRecord(id);
      } catch {
        oldData = null;
      }

      const { error } = await supabase.from(EVENT_TABLE).delete().eq('id', id);
      if (error) {
        return buildErrorResponse(handleSupabaseError(error));
      }

      try {
        await logAudit({
          action: 'DELETE',
          module: 'Events',
          record_id: id,
          description: 'Deleted event',
          oldData,
          newData: null,
        });
      } catch (auditError) {
        console.error('Failed to log event delete audit entry:', auditError);
      }

      return buildSuccessResponse(true);
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  /**
   * Toggle published state of an event.
   * @param {string} id
   */
  async togglePublish(id) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(null);
      }

      const original = await getEventRecord(id);
      const nextStatus = original.status === EVENT_STATUS.PUBLISHED ? EVENT_STATUS.DRAFT : EVENT_STATUS.PUBLISHED;

      const updated = await updateEventStatus(id, nextStatus);
      return buildSuccessResponse(updated);
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  async publishEvent(id) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(null);
      }

      const updated = await updateEventStatus(id, EVENT_STATUS.PUBLISHED);
      return buildSuccessResponse(updated);
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  async unpublishEvent(id) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(null);
      }

      const updated = await updateEventStatus(id, EVENT_STATUS.DRAFT);
      return buildSuccessResponse(updated);
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  /**
   * Toggle featured state of an event.
   * @param {string} id
   */
  async toggleFeatured(id) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(null);
      }

      const original = await getEventRecord(id);
      const nextFeatured = !Boolean(original.featured);

      const { data: updated, error } = await supabase
        .from(EVENT_TABLE)
        .update({ featured: nextFeatured })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return buildErrorResponse(handleSupabaseError(error));
      }

      return buildSuccessResponse(normalizeEvent(updated));
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  /**
   * Duplicate an event as a draft copy.
   * @param {string} id
   */
  async duplicateEvent(id) {
    try {
      if (!isSupabaseConfigured) {
        return buildSuccessResponse(null);
      }

      const original = await getEventRecord(id);
      const duplicate = {
        ...original,
        title: `${original.title} (Copy)`,
        slug: original.slug ? `${original.slug}-copy-${Date.now()}` : null,
        status: EVENT_STATUS.DRAFT,
        featured: false,
        created_at: undefined,
        updated_at: undefined,
        id: undefined,
      };

      const { data: inserted, error } = await supabase
        .from(EVENT_TABLE)
        .insert(duplicate)
        .select('*')
        .single();

      if (error) {
        return buildErrorResponse(handleSupabaseError(error));
      }

      return buildSuccessResponse(normalizeEvent(inserted));
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  /**
   * Upload a poster file to Supabase Storage.
   * @param {File} file
   */
  async uploadEventImage(file) {
    try {
      if (!isSupabaseConfigured) {
        return buildErrorResponse({ message: 'Supabase is not configured' });
      }

      if (!supabase.storage) {
        return buildErrorResponse({ message: 'Supabase storage is not configured' });
      }

      const path = await uploadImage(file, 'posters');
      return buildSuccessResponse({ path });
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  async uploadPoster(file) {
    return this.uploadEventImage(file);
  },

  /**
   * Upload a banner file to Supabase Storage.
   * @param {File} file
   */
  async uploadBanner(file) {
    try {
      if (!isSupabaseConfigured) {
        return buildErrorResponse({ message: 'Supabase is not configured' });
      }

      if (!supabase.storage) {
        return buildErrorResponse({ message: 'Supabase storage is not configured' });
      }

      const path = await uploadImage(file, 'banners');
      return buildSuccessResponse({ path });
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  /**
   * Delete an image file from Supabase Storage.
   * @param {string} path
   */
  async deleteEventImage(path) {
    try {
      if (!isSupabaseConfigured) {
        return buildErrorResponse({ message: 'Supabase is not configured' });
      }

      if (!supabase.storage) {
        return buildErrorResponse({ message: 'Supabase storage is not configured' });
      }

      const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      if (error) {
        return buildErrorResponse(handleSupabaseError(buildStorageError(error)));
      }

      return buildSuccessResponse(true);
    } catch (error) {
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  async deleteImage(path) {
    return this.deleteEventImage(path);
  },
};
