import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'team_members';
const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  import.meta.env.VITE_SUPABASE_TEAM_BUCKET ||
  import.meta.env.VITE_SUPABASE_RESOURCES_BUCKET ||
  'resources';
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function success(data) {
  return { success: true, data, error: null };
}

function failure(message) {
  return { success: false, data: null, error: { message } };
}

function normalizeMember(member) {
  if (!member) return member;
  return {
    ...member,
    full_name: member.full_name || member.name || '',
    profile_image: member.profile_image || member.photo_url || null,
    active: member.active !== false,
    featured: Boolean(member.featured),
  };
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data?.user?.id) throw new Error('Authenticated user is required to manage team members.');
  return data.user;
}

export const teamMemberService = {
  async getTeamMembers() {
    if (!isSupabaseConfigured || !supabase) return success([]);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    return error ? failure(error.message || 'Failed to load team members.') : success((data || []).map(normalizeMember));
  },

  async uploadProfileImage(file) {
    if (!isSupabaseConfigured || !supabase) return failure('Supabase is not configured.');
    if (!file) return failure('Please choose a profile image.');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return failure('Only PNG, JPEG, and WEBP images are supported.');
    if (file.size > MAX_PROFILE_IMAGE_SIZE) return failure('Profile image is too large. Maximum allowed size is 5MB.');

    const safeName = (file.name || 'profile-image').toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
    const extension = safeName.includes('.') ? safeName.slice(safeName.lastIndexOf('.')) : '.jpg';
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const filePath = `team-members/${Date.now()}-${uniqueId}${extension}`;
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) return failure(error.message || 'Failed to upload profile image.');

    const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data?.path || filePath).data?.publicUrl;
    return publicUrl ? success({ publicUrl, storagePath: data?.path || filePath }) : failure('Profile image uploaded, but its public URL could not be generated.');
  },

  async createTeamMember(payload) {
    if (!isSupabaseConfigured || !supabase) return failure('Supabase is not configured.');

    try {
      const user = await getCurrentUser();
      const { data, error } = await supabase.from(TABLE_NAME).insert([{ ...payload, created_by: user.id }]).select('*').single();
      if (error) return failure(error.message || 'Failed to create team member.');
      await logAudit({ action: 'CREATE', module: 'Team Members', record_id: data.id, description: 'Created team member', newData: data });
      return success(normalizeMember(data));
    } catch (error) {
      return failure(error.message || 'Failed to create team member.');
    }
  },

  async updateTeamMember(id, payload) {
    if (!isSupabaseConfigured || !supabase) return failure('Supabase is not configured.');

    try {
      const { data: oldData } = await supabase.from(TABLE_NAME).select('*').eq('id', id).maybeSingle();
      const { data, error } = await supabase.from(TABLE_NAME).update(payload).eq('id', id).select('*').single();
      if (error) return failure(error.message || 'Failed to update team member.');
      await logAudit({ action: 'UPDATE', module: 'Team Members', record_id: id, description: 'Updated team member', oldData, newData: data });
      return success(normalizeMember(data));
    } catch (error) {
      return failure(error.message || 'Failed to update team member.');
    }
  },

  async deleteTeamMember(id) {
    if (!isSupabaseConfigured || !supabase) return failure('Supabase is not configured.');

    try {
      const { data: oldData } = await supabase.from(TABLE_NAME).select('*').eq('id', id).maybeSingle();
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
      if (error) return failure(error.message || 'Failed to delete team member.');
      await logAudit({ action: 'DELETE', module: 'Team Members', record_id: id, description: 'Deleted team member', oldData });
      return success(true);
    } catch (error) {
      return failure(error.message || 'Failed to delete team member.');
    }
  },
};
