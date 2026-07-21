import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'community_members';

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

export const communityMemberService = {
  async getCommunityMembers() {
    if (!isSupabaseConfigured || !supabase) {
      return buildSuccess([]);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return buildError(error.message || 'Failed to load community members.');
    }

    return buildSuccess(data || []);
  },

  async createCommunityMember(payload) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to create community member.');
    }

    try {
      await logAudit({
        action: 'CREATE',
        module: 'Community Members',
        record_id: data?.id ?? null,
        description: 'Created community member',
        oldData: null,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log community member create audit entry:', auditError);
    }

    return buildSuccess(data);
  },

  async updateCommunityMember(id, payload) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    let oldData = null;
    const existingRecord = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (!existingRecord.error) {
      oldData = existingRecord.data;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to update community member.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Community Members',
        record_id: id,
        description: 'Updated community member',
        oldData,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log community member update audit entry:', auditError);
    }

    return buildSuccess(data);
  },

  async deleteCommunityMember(id) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    let oldData = null;
    const existingRecord = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (!existingRecord.error) {
      oldData = existingRecord.data;
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      return buildError(error.message || 'Failed to delete community member.');
    }

    try {
      await logAudit({
        action: 'DELETE',
        module: 'Community Members',
        record_id: id,
        description: 'Deleted community member',
        oldData,
        newData: null,
      });
    } catch (auditError) {
      console.error('Failed to log community member delete audit entry:', auditError);
    }

    return buildSuccess(null);
  },
};
