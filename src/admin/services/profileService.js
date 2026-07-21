import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'admin_users';
const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_PROFILE_BUCKET ||
  import.meta.env.VITE_SUPABASE_EVENTS_BUCKET ||
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  'events';
const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

function buildSuccess(data) {
  return {
    success: true,
    data,
    error: null,
  };
}

function buildError(message) {
  return {
    success: false,
    data: null,
    error: { message },
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

function serializeProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return {};
  }

  const allowedFields = [
    'first_name',
    'last_name',
    'phone',
    'job_title',
    'department',
    'profile_photo',
    'theme',
    'timezone',
    'language',
    'email_notifications',
    'contact_notifications',
    'event_notifications',
  ];

  return Object.fromEntries(
    Object.entries(profile).filter(([key]) => allowedFields.includes(key))
  );
}

async function getAuthenticatedUser() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message || 'Unable to determine the authenticated user.');
  }

  return data?.user ?? null;
}

export async function getAdminProfile(authUser) {
  const fallback = {
    firstName: null,
    fullName: null,
    email: authUser?.email ?? null,
  };

  console.time('getAdminProfile');
  console.log('getAdminProfile authUser id=', authUser?.id, 'email=', authUser?.email);

  try {
    const result = await profileService.getProfile();
    console.log('getAdminProfile result=', result);

    if (!result.success || !result.data) {
      return fallback;
    }

    const profile = result.data;
    const firstName = profile.first_name || profile.full_name || profile.name || null;

    return {
      firstName,
      fullName: firstName,
      email: profile.email || authUser?.email || null,
      role: profile.role || null,
    };
  } catch (error) {
    console.error('getAdminProfile error=', error);
    return fallback;
  } finally {
    console.timeEnd('getAdminProfile');
  }
}

export const profileService = {
  async getProfile() {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    try {
      const user = await getAuthenticatedUser();
      if (!user?.id) {
        return buildError('Authenticated user is required.');
      }

      console.time('profileService.getProfile admin_users query');
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      console.timeEnd('profileService.getProfile admin_users query');
      console.log('profileService.getProfile auth user id=', user.id, 'query=', { table: TABLE_NAME, filter: { id: user.id }, maybeSingle: true }, 'result=', data, 'error=', error);

      if (error) {
        return buildError(error.message || 'Failed to load profile.');
      }

      return buildSuccess(data || null);
    } catch (error) {
      return buildError(error.message || 'Failed to load profile.');
    }
  },

  async updateProfile(profile) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    try {
      const user = await getAuthenticatedUser();
      if (!user?.id) {
        return buildError('Authenticated user is required.');
      }

      const { data: existingRecord, error: existingError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (existingError) {
        return buildError(existingError.message || 'Failed to load the current profile.');
      }

      const sanitizedPayload = serializeProfile(profile);
      if (Object.keys(sanitizedPayload).length === 0) {
        return buildSuccess(existingRecord || null);
      }

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(sanitizedPayload)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) {
        return buildError(error.message || 'Failed to update profile.');
      }

      try {
        await logAudit({
          action: 'UPDATE',
          module: 'Profile',
          recordId: user.id,
          description: 'Updated profile',
          oldData: existingRecord,
          newData: data,
        });
      } catch (auditError) {
        console.error('Failed to log profile update audit entry:', auditError);
      }

      return buildSuccess(data);
    } catch (error) {
      return buildError(error.message || 'Failed to update profile.');
    }
  },

  async uploadProfilePhoto(file) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!file) {
      return buildError('Please choose an image to upload.');
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
      return buildError('Image is too large. Maximum allowed size is 5MB.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      return buildError('Invalid file type. Only image files are allowed.');
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExtensions.includes(fileExtension)) {
      return buildError('Invalid file extension. Only image files are allowed.');
    }

    try {
      const user = await getAuthenticatedUser();
      if (!user?.id) {
        return buildError('Authenticated user is required.');
      }

      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9\.]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const filePath = `profiles/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        const storageError = buildStorageError(uploadError);
        return buildError(storageError?.message || 'Failed to upload profile photo.');
      }

      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl || null;

      if (!publicUrl) {
        return buildError('Unable to generate the public URL for the uploaded photo.');
      }

      const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update({ profile_photo: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        return buildError(updateError.message || 'Failed to save profile photo.');
      }

      return buildSuccess(publicUrl);
    } catch (error) {
      return buildError(error.message || 'Failed to upload profile photo.');
    }
  },

  async changePassword(newPassword) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!newPassword || String(newPassword).trim().length < 6) {
      return buildError('Password must be at least 6 characters long.');
    }

    try {
      const { data, error } = await supabase.auth.updateUser({ password: String(newPassword) });

      if (error) {
        return buildError(error.message || 'Failed to change password.');
      }

      return buildSuccess(data);
    } catch (error) {
      return buildError(error.message || 'Failed to change password.');
    }
  },
};
