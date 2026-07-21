import { supabase, isSupabaseConfigured, handleSupabaseError } from '../../lib/supabase';
import { RESOURCE_STATUS } from '../../constants/status';
import { logAudit } from './auditService';

const RESOURCE_TABLE = 'resources';
const REQUEST_TIMEOUT_MS = 12000;

function buildErrorResponse(error) {
  return {
    success: false,
    data: null,
    error: error || { message: 'An unknown error occurred' },
  };
}

function buildSuccessResponse(data) {
  return {
    success: true,
    data,
    error: null,
  };
}

function toFriendlyError(message, fallback = 'Something went wrong while processing resources.') {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('network') || normalized.includes('failed to fetch')) {
    return 'A network error occurred while connecting to Supabase. Please try again.';
  }
  if (normalized.includes('row-level security') || normalized.includes('permission') || normalized.includes('not authorized')) {
    return 'You do not have permission to perform this action.';
  }

  return message || fallback;
}

async function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timerId);
  }
}

function slugify(title) {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseCurrency(value) {
  const normalized = String(value || 'NGN').trim().toUpperCase();
  return normalized || 'NGN';
}

function parsePrice(value) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function inferPlatform(url) {
  if (!url) return 'External';

  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('selar')) return 'Selar';
    if (host.includes('gumroad')) return 'Gumroad';
    if (host.includes('drive.google')) return 'Google Drive';
    if (host.includes('paystack')) return 'Paystack Store';
    return 'External';
  } catch {
    return 'External';
  }
}

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }

  return '';
}

function normalizeResource(row) {
  if (!row) return null;

  const externalUrl = normalizeUrl(row.external_url);

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    author: row.author || '',
    category: row.category || row.resource_type || 'general',
    resourceType: row.resource_type || row.category || 'general',
    type: row.resource_type || row.category || 'general',
    coverImage: row.cover_image || '',
    externalUrl,
    platform: row.platform || inferPlatform(externalUrl),
    buttonText: row.button_text || '',
    currency: row.currency ? parseCurrency(row.currency) : null,
    price: row.price != null ? parsePrice(row.price) : null,
    featured: Boolean(row.featured),
    status: row.status || RESOURCE_STATUS.DRAFT,
    slug: row.slug,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

function validateExternalUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    return { valid: false, message: 'External URL is required and must start with http:// or https://.' };
  }

  return { valid: true, value: normalized };
}

function cleanDbPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  );
}

function extractMissingColumn(errorMessage) {
  const match = String(errorMessage || '').match(/Could not find the '(.+?)' column/);
  return match ? match[1] : null;
}

function buildResourcePayload(payload) {
  const title = String(payload.title || '').trim();
  const description = String(payload.description || '').trim();
  const category = String(payload.category || '').trim();
  const resourceType = String(payload.resourceType || payload.resource_type || '').trim();
  const author = String(payload.author || payload.author || '').trim();

  if (!title) {
    return { error: { message: 'Resource title is required.' } };
  }

  if (!description) {
    return { error: { message: 'Description is required.' } };
  }

  if (!category) {
    return { error: { message: 'Category is required.' } };
  }

  if (!resourceType) {
    return { error: { message: 'Resource type is required.' } };
  }

  const urlValidation = validateExternalUrl(payload.externalUrl || payload.external_url);
  if (!urlValidation.valid) {
    return { error: { message: urlValidation.message } };
  }

  const normalizedPlatform = String(payload.platform || '').trim();
  const status = payload.status || RESOURCE_STATUS.DRAFT;
  const normalizedPrice = payload.price === '' || payload.price == null ? null : parsePrice(payload.price);
  const normalizedCurrency = payload.currency ? parseCurrency(payload.currency) : null;

  return {
    data: cleanDbPayload({
      title,
      description,
      author: author || null,
      category,
      resource_type: resourceType,
      cover_image: payload.coverImage || payload.cover_image || null,
      external_url: urlValidation.value,
      platform: normalizedPlatform || inferPlatform(urlValidation.value),
      button_text: String(payload.buttonText || payload.button_text || '').trim() || null,
      price: normalizedPrice,
      currency: normalizedCurrency,
      featured: Boolean(payload.featured),
      status,
    }),
  };
}

async function executeDbRequestWithFallback(requestFn, payload) {
  let sanitizedPayload = cleanDbPayload(payload);
  let response = await requestFn(sanitizedPayload);
  let retryCount = 0;
  const maxRetries = 5;

  while (response.error && retryCount < maxRetries) {
    const missingColumn = extractMissingColumn(response.error.message);
    if (!missingColumn || !Object.prototype.hasOwnProperty.call(sanitizedPayload, missingColumn)) {
      break;
    }

    delete sanitizedPayload[missingColumn];
    retryCount += 1;
    response = await requestFn(sanitizedPayload);
  }

  return response;
}

export const resourceService = {
  async getResources() {
    console.log('getResources START');

    try {
      let user = null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: userData, error: userError } = await withTimeout(
            supabase.auth.getUser(),
            REQUEST_TIMEOUT_MS,
            'Timed out while loading the current user for resources.'
          );
          user = userData?.user ?? null;
          console.log('Current user', user);
          if (userError) {
            console.log('Current user error', userError);
          }
        } catch (userError) {
          console.log('Current user exception', userError);
          user = null;
        }
      }

      if (!isSupabaseConfigured || !supabase) {
        console.log('getResources: Supabase not configured');
        return buildSuccessResponse([]);
      }

      console.log('Calling Supabase...');
      const safeResult = await withTimeout(
        supabase
          .from(RESOURCE_TABLE)
          .select('*')
          .order('created_at', { ascending: false }),
        REQUEST_TIMEOUT_MS,
        'Timed out while loading resources.'
      );

      const { data, error } = safeResult || {};
      console.log('Supabase response', data);
      console.log('Supabase error', error);

      if (error) {
        console.error('resourceService.getResources: supabase error', error);
        return buildErrorResponse(handleSupabaseError(error));
      }

      const normalizedResources = (data || []).map(normalizeResource);
      console.log('Normalized resources', normalizedResources);
      return buildSuccessResponse(normalizedResources);
    } catch (error) {
      console.error('resourceService.getResources: exception', error);
      return buildErrorResponse(handleSupabaseError(error));
    }
  },

  async createResource(payload) {
    try {
      if (!isSupabaseConfigured || !supabase) {
        return buildErrorResponse({ message: 'Supabase is not configured.' });
      }

      const authResult = await withTimeout(
        supabase.auth.getUser(),
        REQUEST_TIMEOUT_MS,
        'Timed out while validating your authenticated session.'
      );

      const user = authResult?.data?.user;
      const authError = authResult?.error;

      if (authError || !user?.id) {
        return buildErrorResponse({ message: 'Unable to determine the authenticated user.' });
      }

      const adminResult = await withTimeout(
        supabase
          .from('admin_users')
          .select('active, role')
          .eq('id', user.id)
          .maybeSingle(),
        REQUEST_TIMEOUT_MS,
        'Timed out while validating admin status.'
      );

      const adminCheck = adminResult?.data;
      const adminError = adminResult?.error;

      console.log('USER', user);
      console.log('USER ERROR', authError);
      console.log('IS ADMIN', adminCheck);
      console.log('ADMIN ERROR', adminError);

      if (adminError || !adminCheck) {
        return buildErrorResponse({ message: 'Unable to verify admin status.' });
      }

      const role = String(adminCheck.role || '').trim();
      const isAdmin = adminCheck.active === true && (role === 'Admin' || role === 'Super Admin');
      if (!isAdmin) {
        return buildErrorResponse({ message: 'You must be an active admin to perform this action.' });
      }

      const normalizedTitle = String(payload.title || '').trim();
      if (!normalizedTitle) {
        return buildErrorResponse({ message: 'Resource title is required.' });
      }

      const mapped = buildResourcePayload(payload);
      if (mapped.error) {
        return buildErrorResponse(mapped.error);
      }

      console.log('createResource authenticated user id:', user?.id);
      console.log('createResource validated payload:', mapped.data);

      const insertPayload = {
        title: normalizedTitle,
        slug: `${slugify(normalizedTitle) || 'resource'}-${Date.now()}`,
        description: mapped.data.description,
        category: mapped.data.category,
        resource_type: mapped.data.resource_type,
        author: mapped.data.author,
        cover_image: mapped.data.cover_image,
        external_url: mapped.data.external_url,
        platform: mapped.data.platform,
        button_text: mapped.data.button_text,
        featured: mapped.data.featured,
        status: mapped.data.status,
        price: mapped.data.price,
        currency: mapped.data.currency,
        created_by: user.id,
      };

      console.log('INSERT PAYLOAD', insertPayload);
      const { data, error } = await supabase
        .from(RESOURCE_TABLE)
        .insert(insertPayload)
        .select()
        .single();

      console.log('INSERT RESULT', { data, error });

      if (error) {
        console.error('INSERT ERROR', error);
        throw error;
      }

      try {
        await logAudit({
          action: 'CREATE',
          module: 'Resources',
          record_id: data?.id ?? null,
          description: 'Created resource',
          oldData: null,
          newData: data,
        });
      } catch (auditError) {
        console.error('Failed to log resource create audit entry:', auditError);
      }

      return buildSuccessResponse(normalizeResource(data));
    } catch (error) {
      console.error('createResource exception:', error);
      console.error('createResource exception code:', error?.code);
      console.error('createResource exception message:', error?.message);
      console.error('createResource exception details:', error?.details);
      console.error('createResource exception hint:', error?.hint);
      throw error;
    }
  },

  async updateResource(id, payload) {
    try {
      if (!isSupabaseConfigured || !supabase) {
        return buildErrorResponse({ message: 'Supabase is not configured.' });
      }

      const normalizedTitle = String(payload.title || '').trim();
      if (!normalizedTitle) {
        return buildErrorResponse({ message: 'Resource title is required.' });
      }

      const mapped = buildResourcePayload(payload);
      if (mapped.error) {
        return buildErrorResponse(mapped.error);
      }

      const updatePayload = {
        ...mapped.data,
        title: normalizedTitle,
        updated_at: new Date().toISOString(),
      };

      let oldData = null;
      const existingRecord = await supabase.from(RESOURCE_TABLE).select('*').eq('id', id).single();
      if (!existingRecord.error) {
        oldData = existingRecord.data;
      }

      const updateRequest = (dbPayload) => supabase.from(RESOURCE_TABLE).update(dbPayload).eq('id', id).select('*').single();
      const { data, error } = await executeDbRequestWithFallback(
        (dbPayload) => withTimeout(updateRequest(dbPayload), REQUEST_TIMEOUT_MS, 'Timed out while updating the resource.'),
        updatePayload
      );

      if (error) {
        return buildErrorResponse({
          ...handleSupabaseError(error),
          message: toFriendlyError(error.message, 'Failed to update resource in database.'),
        });
      }

      try {
        await logAudit({
          action: 'UPDATE',
          module: 'Resources',
          record_id: id,
          description: 'Updated resource',
          oldData,
          newData: data,
        });
      } catch (auditError) {
        console.error('Failed to log resource update audit entry:', auditError);
      }

      return buildSuccessResponse(normalizeResource(data));
    } catch (error) {
      const parsed = handleSupabaseError(error);
      return buildErrorResponse({
        ...parsed,
        message: toFriendlyError(parsed?.message, 'Failed to update resource.'),
      });
    }
  },

  async deleteResource(id) {
    try {
      if (!isSupabaseConfigured || !supabase) {
        return buildErrorResponse({ message: 'Supabase is not configured.' });
      }

      let oldData = null;
      const existingRecord = await supabase.from(RESOURCE_TABLE).select('*').eq('id', id).single();
      if (!existingRecord.error) {
        oldData = existingRecord.data;
      }

      const { error } = await withTimeout(
        supabase.from(RESOURCE_TABLE).delete().eq('id', id),
        REQUEST_TIMEOUT_MS,
        'Timed out while deleting resource record.'
      );

      if (error) {
        return buildErrorResponse({
          ...handleSupabaseError(error),
          message: toFriendlyError(error.message, 'Failed to delete resource from database.'),
        });
      }

      try {
        await logAudit({
          action: 'DELETE',
          module: 'Resources',
          record_id: id,
          description: 'Deleted resource',
          oldData,
          newData: null,
        });
      } catch (auditError) {
        console.error('Failed to log resource delete audit entry:', auditError);
      }

      return buildSuccessResponse(true);
    } catch (error) {
      const parsed = handleSupabaseError(error);
      return buildErrorResponse({
        ...parsed,
        message: toFriendlyError(parsed?.message, 'Failed to delete resource.'),
      });
    }
  },
};