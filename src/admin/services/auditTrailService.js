import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const TABLE_NAME = 'audit_logs';
const PAGE_SIZE = 10;

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

function normalizeAuditEntry(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    createdAt: record.created_at || null,
    userName: record.user_name || record.user_name || 'Unknown',
    action: record.action || 'UNKNOWN',
    module: record.module || 'Unknown',
    description: record.description || '',
    oldData: record.old_data ?? null,
    newData: record.new_data ?? null,
  };
}

export const auditTrailService = {
  async getAuditEntries({ page = 1, pageSize = PAGE_SIZE, search = '', dateFrom = '', dateTo = '', user = '', module = '', action = '' } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`user_name.ilike.%${search}%,description.ilike.%${search}%,action.ilike.%${search}%,module.ilike.%${search}%`);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (user) {
      query = query.ilike('user_name', `%${user}%`);
    }

    if (module) {
      query = query.eq('module', module);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return buildError(error.message || 'Failed to load audit trail.');
    }

    return buildSuccess({
      items: (data || []).map(normalizeAuditEntry),
      count: count ?? (data || []).length,
      page,
      pageSize,
    });
  },

  async getRecentAuditEntries(limit = 10) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return buildError(error.message || 'Failed to load recent audit activity.');
    }

    return buildSuccess((data || []).map(normalizeAuditEntry));
  },
};
