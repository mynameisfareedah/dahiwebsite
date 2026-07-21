import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export async function logAudit({
  action,
  module,
  recordId,
  record_id: recordIdAlias,
  description,
  oldData = null,
  newData = null,
}) {
  const resolvedRecordId = recordId ?? recordIdAlias ?? null;

  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase is not configured. Unable to log audit event.');
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Failed to get authenticated user for audit log:', authError);
      return { success: false, error: authError };
    }

    const authUser = authData?.user;
    if (!authUser) {
      console.error('No authenticated user available for audit log.');
      return { success: false, error: 'No authenticated user' };
    }

    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('first_name')
      .eq('id', authUser.id)
      .maybeSingle();

    if (adminError) {
      console.error('Failed to fetch admin user first_name for audit log:', adminError);
      return { success: false, error: adminError };
    }

    const userName = adminUser?.first_name || authUser.email || null;

    const payload = [
      {
        user_id: authUser.id,
        user_name: userName,
        action,
        module,
        record_id: resolvedRecordId,
        description,
        old_data: oldData,
        new_data: newData,
      },
    ];

    const result = await supabase.from('audit_logs').insert(payload);

    if (result.error) {
      console.error('Failed to insert audit log:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Unexpected error logging audit event:', error);
    return { success: false, error };
  }
}

