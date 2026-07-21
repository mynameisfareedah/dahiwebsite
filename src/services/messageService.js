import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logAudit } from '../admin/services/auditService';

const TABLE_NAME = 'messages';

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

function normalizeMessage(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    sender: record.name || 'Anonymous',
    subject: record.subject || 'No subject',
    preview: record.message ? record.message.slice(0, 120) : '',
    fullMessage: record.message || '',
    date: record.created_at || record.updated_at || new Date().toISOString(),
    isRead: Boolean(record.read),
    category: record.category || 'general',
    status: record.status || 'new',
  };
}

async function ensureAuthenticatedUser() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  let { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message || 'Unable to determine the authenticated user.');
  }

  if (!user?.id) {
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) {
      throw new Error(anonError.message || 'Unable to authenticate message submission.');
    }

    user = anonData?.user;
  }

  if (!user?.id) {
    throw new Error('Authenticated user is required to create a message.');
  }

  return user;
}

export const messageService = {
  async getMessages() {
    if (!isSupabaseConfigured || !supabase) {
      return buildSuccess([]);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return buildError(error.message || 'Failed to load messages.');
    }

    return buildSuccess((data || []).map(normalizeMessage));
  },

  async createMessage(payload) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    try {
      await ensureAuthenticatedUser();
    } catch (error) {
      return buildError(error.message || 'Failed to authenticate message submission.');
    }

    const insertPayload = {
      ...payload,
      status: payload.status || 'new',
      read: payload.read ?? false,
      archived: payload.archived ?? false,
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([insertPayload])
      .select('*')
      .single();

    if (error) {
      return buildError(error.message || 'Failed to create message.');
    }

    try {
      await logAudit({
        action: 'CREATE',
        module: 'Messages',
        record_id: data?.id ?? null,
        description: 'Created message',
        oldData: null,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log message create audit entry:', auditError);
    }

    return buildSuccess(normalizeMessage(data));
  },

  async updateMessage(id, payload) {
    if (!isSupabaseConfigured || !supabase) {
      return buildError('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    let oldData = null;
    const existingRecord = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (!existingRecord.error) {
      oldData = existingRecord.data;
    }

    if (error) {
      return buildError(error.message || 'Failed to update message.');
    }

    try {
      await logAudit({
        action: 'UPDATE',
        module: 'Messages',
        record_id: id,
        description: 'Updated message',
        oldData,
        newData: data,
      });
    } catch (auditError) {
      console.error('Failed to log message update audit entry:', auditError);
    }

    return buildSuccess(normalizeMessage(data));
  },

  async deleteMessage(id) {
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
      return buildError(error.message || 'Failed to delete message.');
    }

    try {
      await logAudit({
        action: 'DELETE',
        module: 'Messages',
        record_id: id,
        description: 'Deleted message',
        oldData,
        newData: null,
      });
    } catch (auditError) {
      console.error('Failed to log message delete audit entry:', auditError);
    }

    return buildSuccess(true);
  },
};
