import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'team_members';
const STORAGE_BUCKET = 'profile-photos';
const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

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

function cleanDbPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload || {}).filter(([, value]) => value !== undefined && value !== null)
  );
}

function buildStorageError(error) {
  if (!error) return null;

  const message = String(error.message || error.msg || error.code || '');
  if (message.toLowerCase().includes('bucket not found')) {
    return {
      message:
        `Supabase storage bucket "${STORAGE_BUCKET}" was not found. ` +
        'Create the bucket in the Supabase dashboard or verify the bucket name.',
    };
  }

  return error;
}

function buildSafeFilePath(file) {
  const safeName = (file.name || 'profile-image')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const extension = safeName.includes('.') ? safeName.slice(safeName.lastIndexOf('.')) : '.jpg';
  const uniqueSuffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${TABLE_NAME}/${Date.now()}-${uniqueSuffix}${extension}`;
}

function normalizeTeamMemberPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  return cleanDbPayload({
    full_name: payload.full_name,
    role: payload.role,
    department: payload.department,
    bio: payload.bio,
    profile_image: payload.profile_image,
    email: payload.email,
    linkedin_url: payload.linkedin_url,
    display_order:
      payload.display_order != null && payload.display_order !== ''
        ? Number(payload.display_order)
        : null,
    featured: Boolean(payload.featured),
    active: payload.active !== false,
  });
}

async function requireUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message || 'Unable to determine the authenticated user.');
  }

  if (!user?.id) {
    throw new Error('Authenticated user is required to perform this action.');
  }

  return user.id;
}

export const teamMemberService = {
  async getTeamMembers() {
    if (!isSupabaseConfigured || !supabase) {
      return buildSuccess([]);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      return buildError(error.message || 'Failed to load team members.');
    }

    return buildSuccess(data || []);
  },

  async getTeamMember(id) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!id) {
      return buildError('Team member id is required.');
    }

    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();

    if (error) {
      return buildError(error.message || 'Failed to load the team member.');
    }

    if (!data) {
      return buildError('Team member not found.');
    }

    return buildSuccess(data);
  },

  async createTeamMember(payload) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const userId = await requireUserId();
    const insertPayload = normalizeTeamMemberPayload(payload);

    if (!insertPayload.full_name) {
      return buildError('Full name is required.');
    }

    if (!insertPayload.role) {
      return buildError('Role is required.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...insertPayload, created_by: userId }])
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to create team member.');
    }

    try {
      await logAudit({
        action: 'CREATE',
        module: 'Team Members',
        record_id: data?.id ?? null,
        description: 'Created team member',
        oldData: null,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log team member create audit entry:', auditError);
    }

    return buildSuccess(data);
  },

  async updateTeamMember(id, payload) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!id) {
      return buildError('Team member id is required.');
    }

    const updatePayload = normalizeTeamMemberPayload(payload);

    if (Object.keys(updatePayload).length === 0) {
      return buildError('No valid fields were provided to update.');
    }

    let oldData = null;
    const existingRecord = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (!existingRecord.error) {
      oldData = existingRecord.data;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to update team member.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Team Members',
        record_id: id,
        description: 'Updated team member',
        oldData,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log team member update audit entry:', auditError);
    }

    return buildSuccess(data);
  },

  async deleteTeamMember(id) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!id) {
      return buildError('Team member id is required.');
    }

    let oldData = null;
    const existingRecord = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (!existingRecord.error) {
      oldData = existingRecord.data;
    }

    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      return buildError(error.message || 'Failed to delete team member.');
    }

    try {
      await logAudit({
        action: 'DELETE',
        module: 'Team Members',
        record_id: id,
        description: 'Deleted team member',
        oldData,
        newData: null,
      });
    } catch (auditError) {
      console.error('Failed to log team member delete audit entry:', auditError);
    }

    return buildSuccess(true);
  },

  async uploadProfileImage(file) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    if (!file) {
      throw new Error('Please choose an image to upload.');
    }

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Only PNG, JPEG, and WEBP images are supported.');
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      throw new Error('Image is too large. Maximum allowed size is 5MB.');
    }

    const filePath = buildSafeFilePath(file);
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      const storageError = buildStorageError(error);
      throw new Error(storageError?.message || error.message || 'Failed to upload profile image.');
    }

    const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data?.path || filePath).data?.publicUrl;
    if (!publicUrl) {
      throw new Error('The profile image upload completed, but a public URL could not be generated.');
    }

    return {
      publicUrl,
      storagePath: data?.path || filePath,
    };
  },
};
