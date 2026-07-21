import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'admin_users';

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

async function ensureSuperAdmin() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(authError.message || 'Unable to determine authenticated user.');
  }

  const authUser = authData?.user;
  if (!authUser?.id) {
    throw new Error('Authenticated user is required.');
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Unable to validate admin permissions.');
  }

  if (!data || String(data.role || '').trim() !== 'Super Admin') {
    throw new Error('Super Admin permission required.');
  }

  return true;
}

async function getAuthenticatedUser() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message || 'Unable to determine authenticated user.');
  }

  return data?.user || null;
}

export const adminUserService = {
  async getAdmins() {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      return buildError(error.message || 'Failed to load admins.');
    }

    return buildSuccess(data || []);
  },

  async getAdmin(id) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!id) {
      return buildError('Admin ID is required.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return buildError(error.message || 'Failed to load admin.');
    }

    return buildSuccess(data || null);
  },

  async updateAdmin(id, updatedData) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!id) {
      return buildError('Admin ID is required.');
    }

    const { data: existing, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      return buildError(fetchError.message || 'Failed to load existing admin.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updatedData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to update admin.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Admin Users',
        recordId: id,
        description: 'Updated admin user',
        oldData: existing,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log admin user update:', auditError);
    }

    return buildSuccess(data);
  },

  async deactivateAdmin(id) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!id) {
      return buildError('Admin ID is required.');
    }

    const { data: existing, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      return buildError(fetchError.message || 'Failed to load existing admin.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ active: false, status: 'Inactive' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to deactivate admin.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Admin Users',
        recordId: id,
        description: 'Deactivated admin user',
        oldData: existing,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log admin user deactivation:', auditError);
    }

    return buildSuccess(data);
  },

  async activateAdmin(id) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!id) {
      return buildError('Admin ID is required.');
    }

    const { data: existing, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      return buildError(fetchError.message || 'Failed to load existing admin.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ active: true, status: 'Active' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to activate admin.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Admin Users',
        recordId: id,
        description: 'Activated admin user',
        oldData: existing,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log admin user activation:', auditError);
    }

    return buildSuccess(data);
  },

  async deleteAdmin(id) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    if (!id) {
      return buildError('Admin ID is required.');
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      return buildError(authError.message || 'Unable to determine authenticated user.');
    }

    const authUser = authData?.user;
    if (!authUser?.id) {
      return buildError('Authenticated user is required.');
    }

    if (id === authUser.id) {
      return buildError('You cannot delete your own account.');
    }

    const { data: currentUser, error: currentUserError } = await supabase
      .from(TABLE_NAME)
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (currentUserError) {
      return buildError(currentUserError.message || 'Unable to verify current user role.');
    }

    if ((currentUser?.role || '').trim() !== 'Super Admin') {
      return buildError('Only Super Admin can delete administrators.');
    }

    const { data: existing, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      return buildError(fetchError.message || 'Failed to load existing admin.');
    }

    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      return buildError(error.message || 'Failed to delete admin.');
    }

    try {
      await logAudit({
        action: 'DELETE',
        module: 'Admin Users',
        recordId: id,
        description: 'Deleted admin user',
        oldData: existing,
        newData: null,
      });
    } catch (auditError) {
      console.error('Failed to log admin user deletion:', auditError);
    }

    return buildSuccess(true);
  },

  async searchAdmins(search) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const normalizedSearch = String(search || '').trim();
    if (!normalizedSearch) {
      return this.getAdmins();
    }

    const query = supabase.from(TABLE_NAME).select('*');
    query.or(
      `first_name.ilike.%${normalizedSearch}%,last_name.ilike.%${normalizedSearch}%,email.ilike.%${normalizedSearch}%,department.ilike.%${normalizedSearch}%`
    );
    query.order('first_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return buildError(error.message || 'Failed to search admins.');
    }

    return buildSuccess(data || []);
  },
};
