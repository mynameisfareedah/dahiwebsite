import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'volunteers';
const APPLICATIONS_TABLE_NAME = 'volunteer_applications';

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

export const volunteerService = {
  async getVolunteers() {
    if (!isSupabaseConfigured || !supabase) {
      return buildSuccess([]);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return buildError(error.message || 'Failed to load volunteers.');
    }

    return buildSuccess(data || []);
  },

  async createVolunteer(payload) {
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
      throw new Error('Authenticated user is required to create a volunteer.');
    }

    const insertPayload = {
      ...payload,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([insertPayload])
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to create volunteer.');
    }

    try {
      await logAudit({
        action: 'CREATE',
        module: 'Volunteers',
        record_id: data?.id ?? null,
        description: 'Created volunteer',
        oldData: null,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log volunteer create audit entry:', auditError);
    }

    return buildSuccess(data);
  },

  async updateVolunteer(id, payload) {
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
      return buildError(error.message || 'Failed to update volunteer.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Volunteers',
        record_id: id,
        description: 'Updated volunteer',
        oldData,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log volunteer update audit entry:', auditError);
    }

    return buildSuccess(data);
  },

  async deleteVolunteer(id) {
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
      return buildError(error.message || 'Failed to delete volunteer.');
    }

    try {
      await logAudit({
        action: 'DELETE',
        module: 'Volunteers',
        record_id: id,
        description: 'Deleted volunteer',
        oldData,
        newData: null,
      });
    } catch (auditError) {
      console.error('Failed to log volunteer delete audit entry:', auditError);
    }

    return buildSuccess(null);
  },

  async getVolunteerApplications() {
    if (!isSupabaseConfigured || !supabase) {
      return buildSuccess([]);
    }

    const { data, error } = await supabase
      .from(APPLICATIONS_TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return buildError(error.message || 'Failed to load volunteer applications.');
    }

    return buildSuccess(data || []);
  },

  async updateVolunteerApplicationStatus(id, status) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    let oldData = null;
    const existing = await supabase.from(APPLICATIONS_TABLE_NAME).select('*').eq('id', id).single();
    if (!existing.error) {
      oldData = existing.data;
    }

    const { data, error } = await supabase
      .from(APPLICATIONS_TABLE_NAME)
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to update volunteer application status.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Volunteer Applications',
        record_id: id,
        description: `Updated volunteer application status to ${status}`,
        oldData,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log volunteer application status audit entry:', auditError);
    }

    return buildSuccess(data);
  },

  async approveVolunteerApplication(application) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const volunteerPayload = {
      name: application.full_name,
      email: application.email,
      phone: application.phone,
      skills: application.skills,
      availability: application.availability,
      approval_status: 'approved',
      notes: [application.occupation, application.interest, application.experience, application.motivation]
        .filter(Boolean)
        .join(' \n'),
      status: 'active',
    };

    const volunteerResult = await this.createVolunteer(volunteerPayload);
    if (!volunteerResult.success) {
      return volunteerResult;
    }

    const applicationResult = await this.updateVolunteerApplicationStatus(application.id, 'Approved');
    if (!applicationResult.success) {
      return applicationResult;
    }

    return buildSuccess({ volunteer: volunteerResult.data, application: applicationResult.data });
  },

  async rejectVolunteerApplication(id) {
    return this.updateVolunteerApplicationStatus(id, 'Rejected');
  },
};
