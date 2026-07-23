import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function applyTableFilters(query, table) {
  if (table === 'team_members') {
    return query.eq('active', true);
  }

  if (table === 'resources') {
    return query.eq('status', 'published');
  }

  if (table === 'donations') {
    return query.eq('active', true).order('display_order', { ascending: false });
  }

  return query;
}

export function useSupabaseData(table, select = '*', options = {}) {
  return useQuery({
    queryKey: [table, select],
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase) {
        return [];
      }

      try {
        let query = supabase.from(table).select(select).order('created_at', { ascending: false });
        query = applyTableFilters(query, table);

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error for', table, error);
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error('Unexpected error in useSupabaseData for', table, err);
        throw err;
      }
    },
    ...options,
  });
}
