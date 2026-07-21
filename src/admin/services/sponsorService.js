import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logAudit } from './auditService';

const TABLE_NAME = 'sponsors';

function normalizeSponsor(row) {
  if (!row) return row;

  return {
    ...row,
    type: row.type ?? row.sponsorship_level ?? 'Donation',
    amount: row.amount != null ? Number(row.amount) : 0,
  };
}

function normalizeSponsors(rows) {
  return Array.isArray(rows) ? rows.map(normalizeSponsor) : [];
}

function mapSponsorPayload(payload) {
  if (!payload || typeof payload !== 'object') return {};

  const mapped = { ...payload };

  if (payload.type !== undefined) {
    mapped.sponsorship_level = payload.type;
    delete mapped.type;
  }

  if (mapped.amount != null) {
    mapped.amount = Number(mapped.amount);
  }

  return mapped;
}

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

export const sponsorService = {
  async getSponsors() {
    if (!isSupabaseConfigured || !supabase) {
      return buildSuccess([]);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return buildError(error.message || 'Failed to load sponsors.');
    }

    return buildSuccess(normalizeSponsors(data || []));
  },

  async createSponsor(payload) {
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
      throw new Error('Authenticated user is required to create a sponsor.');
    }

    const insertPayload = {
      ...mapSponsorPayload(payload),
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([insertPayload])
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to create sponsor.');
    }

    try {
      await logAudit({
        action: 'CREATE',
        module: 'Sponsors',
        record_id: data?.id ?? null,
        description: 'Created sponsor',
        oldData: null,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log sponsor create audit entry:', auditError);
    }

    return buildSuccess(normalizeSponsor(data));
  },

  async updateSponsor(id, payload) {
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
      .update(mapSponsorPayload(payload))
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to update sponsor.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Sponsors',
        record_id: id,
        description: 'Updated sponsor',
        oldData,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log sponsor update audit entry:', auditError);
    }

    return buildSuccess(normalizeSponsor(data));
  },

  async deleteSponsor(id) {
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
      return buildError(error.message || 'Failed to delete sponsor.');
    }

    try {
      await logAudit({
        action: 'DELETE',
        module: 'Sponsors',
        record_id: id,
        description: 'Deleted sponsor',
        oldData,
        newData: null,
      });
    } catch (auditError) {
      console.error('Failed to log sponsor delete audit entry:', auditError);
    }

    return buildSuccess(null);
  },
};
