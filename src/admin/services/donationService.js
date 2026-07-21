import { supabase, isSupabaseConfigured, handleSupabaseError } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'donations';

function buildSuccess(data) {
  return { success: true, data, error: null };
}

function buildError(message) {
  return { success: false, data: null, error: { message } };
}

function normalize(row) {
  if (!row) return null;
  return {
    ...row,
    goal_amount: row.goal_amount != null ? Number(row.goal_amount) : 0,
    amount_raised: row.amount_raised != null ? Number(row.amount_raised) : 0,
    active: row.active === true,
    featured: Boolean(row.featured),
  };
}

function mapPayload(payload) {
  const p = { ...payload };
  if (p.goal_amount != null) p.goal_amount = Number(p.goal_amount);
  if (p.amount_raised != null) p.amount_raised = Number(p.amount_raised);
  if (p.featured != null) p.featured = Boolean(p.featured);
  if (p.active != null) p.active = Boolean(p.active);
  // Convert empty date strings to null
  if (p.start_date === '') p.start_date = null;
  if (p.end_date === '') p.end_date = null;
  return p;
}

export const donationService = {
  async getDonations() {
    if (!isSupabaseConfigured || !supabase) return buildSuccess([]);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return buildError(error.message || 'Failed to load donations.');
    return buildSuccess((data || []).map(normalize));
  },

  async createDonation(payload) {
    if (!isSupabaseConfigured || !supabase) return buildError('Supabase is not configured.');

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(userError.message || 'Unable to determine the authenticated user.');
    }

    if (!user?.id) throw new Error('Authenticated user is required to create a donation.');

    const insertPayload = { ...mapPayload(payload), created_by: user.id };

    const { data, error } = await supabase.from(TABLE_NAME).insert([insertPayload]).select('*').single();
    if (error) return buildError(error.message || 'Failed to create donation.');

    try {
      await logAudit({ action: 'CREATE', module: 'Donations', record_id: data?.id ?? null, description: 'Created donation campaign', oldData: null, newData: data });
    } catch (auditError) {
      console.error('Failed to log donation create audit entry:', auditError);
    }

    return buildSuccess(normalize(data));
  },

  async updateDonation(id, payload) {
    if (!isSupabaseConfigured || !supabase) return buildError('Supabase is not configured.');

    let oldData = null;
    const existing = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (!existing.error) oldData = existing.data;

    const { data, error } = await supabase.from(TABLE_NAME).update(mapPayload(payload)).eq('id', id).select('*').single();
    if (error) return buildError(error.message || 'Failed to update donation.');

    try {
      await logAudit({ action: 'UPDATE', module: 'Donations', record_id: id, description: 'Updated donation campaign', oldData, newData: data });
    } catch (auditError) {
      console.error('Failed to log donation update audit entry:', auditError);
    }

    return buildSuccess(normalize(data));
  },

  async deleteDonation(id) {
    if (!isSupabaseConfigured || !supabase) return buildError('Supabase is not configured.');

    let oldData = null;
    const existing = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (!existing.error) oldData = existing.data;

    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error) return buildError(error.message || 'Failed to delete donation.');

    try {
      await logAudit({ action: 'DELETE', module: 'Donations', record_id: id, description: 'Deleted donation campaign', oldData, newData: null });
    } catch (auditError) {
      console.error('Failed to log donation delete audit entry:', auditError);
    }

    return buildSuccess(null);
  },
};

export default donationService;
