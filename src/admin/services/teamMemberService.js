import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'team_members';

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

export const teamMemberService = {
  async getTeamMembers() {
    if (!isSupabaseConfigured || !supabase) {
      return buildSuccess([]);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return buildError(error.message || 'Failed to load team members.');
    }

    return buildSuccess(data || []);
  },

  async createTeamMember(payload) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(userError.message || 'Unable to determine the authenticated user.');
    }

    if (!user?.id) {
      throw new Error('Authenticated user is required to create a team member.');
    }

    const insertPayload = {
      ...payload,
      created_by: user.id,
    };

    console.log('createTeamMember user.id', user.id);
    console.log('createTeamMember insert payload', insertPayload);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([insertPayload])
      .select('*')
      .single();

    console.log('createTeamMember supabase insert response', { data, error });

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
};
