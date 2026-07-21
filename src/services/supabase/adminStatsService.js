import { supabase, isSupabaseConfigured, handleSupabaseError } from '../../lib/supabase';

async function countFromTable(table, queryModifier) {
  if (!isSupabaseConfigured || !supabase) {
    return { count: null, error: { message: 'Supabase is not configured' } };
  }

  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    if (typeof queryModifier === 'function') {
      query = queryModifier(query);
    }

    const response = await query;
    console.log(`Supabase raw response for ${table} count:`, response);

    const { count, error } = response;

    if (error) {
      console.error(`Error counting ${table}:`, error);
      return { count: null, error: handleSupabaseError(error) };
    }

    return { count, error: null };
  } catch (err) {
    console.error(`Unexpected error counting ${table}:`, err);
    return { count: null, error: handleSupabaseError(err) };
  }
}

export async function countUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0];
  return countFromTable('events', (query) => query.eq('status', 'published').gte('event_date', today));
}

export async function countPublishedResources() {
  return countFromTable('resources', (query) => query.eq('status', 'published'));
}

export async function countActiveTeamMembers() {
  return countFromTable('team_members', (query) => query.eq('active', true).eq('status', 'active'));
}

export async function countMessages() {
  return countFromTable('messages');
}

export async function countVolunteers() {
  return countFromTable('volunteers');
}

export async function countSponsors() {
  return countFromTable('sponsors', (query) => query.eq('active', true));
}

export async function countCommunityMembers() {
  return countFromTable('community_members', (query) => query.eq('status', 'active'));
}
